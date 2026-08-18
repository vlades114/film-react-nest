import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Film } from './entities/film.entity';
import { Schedule } from './entities/schedule.entity';
import { FilmDto, ScheduleItemDto } from '../films/dto/films.dto';
import {
  FilmsRepository,
  ScheduleUpdate,
  ScheduleNotFoundError,
  ScheduleConflictError,
} from './films-repository.interface';

@Injectable()
export class RepositoryService implements FilmsRepository {
  constructor(
    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getAll(): Promise<FilmDto[]> {
    const films = await this.filmRepository.find({
      relations: ['schedule'],
      order: { rating: 'ASC' },
    });
    return films.map((film) => this.toFilmDto(film));
  }

  async getById(id: string): Promise<FilmDto | null> {
    const film = await this.filmRepository.findOne({
      where: { id },
      relations: ['schedule'],
      order: { rating: 'ASC' },
    });
    if (!film) return null;
    return this.toFilmDto(film);
  }

  async getSchedule(filmId: string): Promise<ScheduleItemDto[] | null> {
    const film = await this.filmRepository.findOne({
      where: { id: filmId },
      select: ['id'],
    });
    if (!film) return null;

    const schedules = await this.scheduleRepository.find({
      where: { film: { id: filmId } },
      order: { daytime: 'ASC' },
    });

    return schedules.map((s) => ({
      id: s.id,
      daytime: s.daytime,
      hall: s.hall,
      rows: s.rows,
      seats: s.seats,
      price: s.price,
      taken: s.taken,
    }));
  }

  async updateFilmSchedule(
    filmId: string,
    scheduleId: string,
    taken: string[],
  ): Promise<void> {
    await this.scheduleRepository.update(
      { id: scheduleId, film: { id: filmId } },
      { taken },
    );
  }

  async batchUpdateSchedule(updates: ScheduleUpdate[]): Promise<void> {
    await this.dataSource.transaction(async (entityManager) => {
      for (const update of updates) {
        const schedule = await entityManager.findOne(Schedule, {
          where: { id: update.scheduleId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!schedule) {
          throw new ScheduleNotFoundError(update.scheduleId);
        }

        const alreadyTaken = new Set(schedule.taken);
        const hasConflict = update.taken.some((s) => alreadyTaken.has(s));
        if (hasConflict) {
          throw new ScheduleConflictError(
            'Сеанс был изменён другим запросом. Попробуйте снова.',
          );
        }

        await entityManager.update(
          Schedule,
          { id: update.scheduleId },
          { taken: [...schedule.taken, ...update.taken] },
        );
      }
    });
  }

  private toFilmDto(film: Film): FilmDto {
    return {
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags,
      image: film.image,
      cover: film.cover,
      title: film.title,
      about: film.about,
      description: film.description,
      schedule: film.schedule.map((s) => ({
        id: s.id,
        daytime: s.daytime,
        hall: s.hall,
        rows: s.rows,
        seats: s.seats,
        price: s.price,
        taken: s.taken,
      })),
    };
  }
}
