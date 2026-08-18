import { LoggerService } from '@nestjs/common';
import { DevLogger } from './dev.logger';
import { JsonLogger } from './json.logger';
import { TskvLogger } from './tskv.logger';

export type LoggerType = 'dev' | 'json' | 'tskv';

/**
 * Выбирает реализацию логгера по значению переменной окружения LOGGER_TYPE.
 * По умолчанию (значение не задано или не распознано) — DevLogger,
 * чтобы локальная разработка не ломалась при отсутствии переменной.
 */
export function createLogger(type: string | undefined): LoggerService {
  switch (type as LoggerType) {
    case 'json':
      return new JsonLogger();
    case 'tskv':
      return new TskvLogger();
    case 'dev':
    default:
      return new DevLogger();
  }
}
