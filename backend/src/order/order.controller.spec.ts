import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderRequestDto, OrderResponseDto } from './dto/order.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: jest.Mocked<OrderService>;

  const createOrderDto: CreateOrderRequestDto = {
    email: 'user@example.com',
    phone: '+79990000000',
    tickets: [
      {
        film: '92b8a2a7-ab6b-4fa9-915b-d27945865e39',
        session: '2644a72a-6f17-4c61-a405-9c48bb0ea682',
        daytime: '2024-06-30T18:00:53+03:00',
        row: 3,
        seat: 5,
        price: 350,
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /order — create', () => {
    it('передаёт тело запроса в сервис как есть и возвращает его результат', async () => {
      const response: OrderResponseDto = {
        total: 1,
        items: [{ ...createOrderDto.tickets[0], id: 'ticket-1' }],
      };
      orderService.create.mockResolvedValue(response);

      const result = await controller.create(createOrderDto);

      expect(orderService.create).toHaveBeenCalledWith(createOrderDto);
      expect(result).toEqual(response);
    });

    it('пробрасывает NotFoundException, если фильм или сеанс не найден', async () => {
      orderService.create.mockRejectedValue(
        new NotFoundException('Session not found'),
      );

      await expect(controller.create(createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('пробрасывает ConflictException, если место уже занято', async () => {
      orderService.create.mockRejectedValue(
        new ConflictException('Seat is already taken'),
      );

      await expect(controller.create(createOrderDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('пробрасывает InternalServerErrorException при сбое обновления расписания', async () => {
      orderService.create.mockRejectedValue(
        new InternalServerErrorException('Schedule not found'),
      );

      await expect(controller.create(createOrderDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
