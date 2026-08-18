import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  FilmsRepository,
  ScheduleUpdate,
  ScheduleNotFoundError,
  ScheduleConflictError,
} from '../repository/films-repository.interface';
import {
  CreateOrderRequestDto,
  OrderResponseDto,
  OrderTicketResponseDto,
} from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(
    @Inject('FILMS_REPOSITORY')
    private readonly filmsRepository: FilmsRepository,
  ) {}

  async create(dto: CreateOrderRequestDto): Promise<OrderResponseDto> {
    const items: OrderTicketResponseDto[] = [];
    const seenSeats = new Set<string>();
    const updates = new Map<string, string[]>();

    for (const ticket of dto.tickets) {
      const film = await this.filmsRepository.getById(ticket.film);
      if (!film) {
        throw new NotFoundException(`Film ${ticket.film} not found`);
      }

      const schedule = film.schedule.find((s) => s.id === ticket.session);
      if (!schedule) {
        throw new NotFoundException(
          `Session ${ticket.session} not found in film ${ticket.film}`,
        );
      }

      const seatKey = `${ticket.row}:${ticket.seat}`;
      const uniqueKey = `${ticket.session}:${seatKey}`;

      if (seenSeats.has(uniqueKey)) {
        throw new ConflictException(
          `Duplicate seat ${seatKey} in session ${ticket.session}`,
        );
      }
      seenSeats.add(uniqueKey);

      if (schedule.taken.includes(seatKey)) {
        throw new ConflictException(
          `Seat ${seatKey} is already taken in session ${ticket.session}`,
        );
      }

      const existing = updates.get(ticket.session) || [];
      existing.push(seatKey);
      updates.set(ticket.session, existing);

      items.push({
        film: ticket.film,
        session: ticket.session,
        daytime: ticket.daytime,
        row: ticket.row,
        seat: ticket.seat,
        price: ticket.price,
        id: uuidv4(),
      });
    }

    const scheduleUpdates: ScheduleUpdate[] = Array.from(updates.entries()).map(
      ([scheduleId, taken]) => ({ scheduleId, taken }),
    );

    try {
      await this.filmsRepository.batchUpdateSchedule(scheduleUpdates);
    } catch (err) {
      if (err instanceof ScheduleConflictError) {
        throw new ConflictException(err.message);
      }
      if (err instanceof ScheduleNotFoundError) {
        throw new InternalServerErrorException(err.message);
      }
      throw err;
    }

    return { total: items.length, items };
  }
}
