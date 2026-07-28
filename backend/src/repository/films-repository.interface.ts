import { FilmDto, ScheduleItemDto } from '../films/dto/films.dto';

export class ScheduleNotFoundError extends Error {
  constructor(scheduleId: string) {
    super(`Schedule ${scheduleId} not found`);
    this.name = 'ScheduleNotFoundError';
  }
}

export class ScheduleConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScheduleConflictError';
  }
}

export interface ScheduleUpdate {
  scheduleId: string;
  taken: string[];
}

export interface FilmsRepository {
  getAll(): Promise<FilmDto[]>;
  getById(id: string): Promise<FilmDto | null>;
  getSchedule(filmId: string): Promise<ScheduleItemDto[] | null>;
  updateFilmSchedule(
    filmId: string,
    scheduleId: string,
    taken: string[],
  ): Promise<void>;
  batchUpdateSchedule(updates: ScheduleUpdate[]): Promise<void>;
}
