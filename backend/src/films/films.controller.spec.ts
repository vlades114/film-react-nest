import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { FilmDto, ScheduleItemDto } from './dto/films.dto';

describe('FilmsController', () => {
  let controller: FilmsController;
  let filmsService: jest.Mocked<FilmsService>;

  const scheduleItem: ScheduleItemDto = {
    id: '2644a72a-6f17-4c61-a405-9c48bb0ea682',
    daytime: '2024-06-30T18:00:53+03:00',
    hall: 2,
    rows: 5,
    seats: 10,
    price: 350,
    taken: [],
  };

  const film: FilmDto = {
    id: '92b8a2a7-ab6b-4fa9-915b-d27945865e39',
    rating: 8.1,
    director: 'Амелия Хьюз',
    tags: ['Рекомендуемые'],
    image: '/bg6s.jpg',
    cover: '/bg6c.jpg',
    title: 'Сон в летний день',
    about:
      'Фэнтези-фильм о группе друзей попавших в волшебный лес, где время остановилось.',
    description:
      'Причудливый фэнтези-фильм, действие которого происходит в волшебном лесу, где время остановилось. Группа друзей натыкается на это заколдованное царство и поначалу проникается беззаботным духом обитателей, но потом друзьям приходится разойтись. А как встретиться снова, если нет ни времени, ни места встречи?',
    schedule: [scheduleItem],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: FilmsService,
          useValue: {
            getAll: jest.fn(),
            getSchedule: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
    filmsService = module.get(FilmsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /films — getAll', () => {
    it('возвращает список фильмов и его размер из сервиса', async () => {
      filmsService.getAll.mockResolvedValue([film]);

      const result = await controller.getAll();

      expect(result).toEqual({ total: 1, items: [film] });
      expect(filmsService.getAll).toHaveBeenCalledTimes(1);
    });

    it('возвращает total: 0 и пустой items, если фильмов нет', async () => {
      filmsService.getAll.mockResolvedValue([]);

      const result = await controller.getAll();

      expect(result).toEqual({ total: 0, items: [] });
    });
  });

  describe('GET /films/:id/schedule — getSchedule', () => {
    it('возвращает расписание для указанного id фильма', async () => {
      filmsService.getSchedule.mockResolvedValue([scheduleItem]);

      const result = await controller.getSchedule(film.id);

      expect(result).toEqual({ total: 1, items: [scheduleItem] });
      expect(filmsService.getSchedule).toHaveBeenCalledWith(film.id);
    });

    it('возвращает total: 0 и пустой items, если у фильма нет сеансов', async () => {
      filmsService.getSchedule.mockResolvedValue([]);

      const result = await controller.getSchedule(film.id);

      expect(result).toEqual({ total: 0, items: [] });
    });

    it('пробрасывает NotFoundException, если сервис не нашёл фильм', async () => {
      filmsService.getSchedule.mockRejectedValue(
        new NotFoundException('Film not found'),
      );

      await expect(controller.getSchedule('unknown-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
