import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FilmDto, ScheduleItemDto } from './dto/films.dto';
import { FilmsRepository } from '../repository/films-repository.interface';

@Injectable()
export class FilmsService {
  constructor(
    @Inject('FILMS_REPOSITORY')
    private readonly filmsRepository: FilmsRepository,
  ) {}

  async getAll(): Promise<FilmDto[]> {
    return this.filmsRepository.getAll();
  }

  async getSchedule(id: string): Promise<ScheduleItemDto[]> {
    const schedule = await this.filmsRepository.getSchedule(id);
    if (!schedule) {
      throw new NotFoundException('Film not found');
    }
    return schedule;
  }
}
