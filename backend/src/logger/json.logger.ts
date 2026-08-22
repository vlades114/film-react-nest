import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

/**
 * Логгер для машин.
 * Форматирует каждую запись в отдельную JSON-строку — удобно для
 * автоматического парсинга (например, агентами сбора логов).
 */
@Injectable()
export class JsonLogger implements LoggerService {
  formatMessage(
    level: LogLevel,
    message: any,
    ...optionalParams: any[]
  ): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message: this.normalize(message),
      ...(optionalParams.length
        ? { optionalParams: optionalParams.map((p) => this.normalize(p)) }
        : {}),
    });
  }

  private normalize(value: any): any {
    if (value instanceof Error) {
      return { name: value.name, message: value.message, stack: value.stack };
    }
    return value;
  }

  log(message: any, ...optionalParams: any[]) {
    console.log(this.formatMessage('log', message, ...optionalParams));
  }

  error(message: any, ...optionalParams: any[]) {
    console.error(this.formatMessage('error', message, ...optionalParams));
  }

  warn(message: any, ...optionalParams: any[]) {
    console.warn(this.formatMessage('warn', message, ...optionalParams));
  }

  debug(message: any, ...optionalParams: any[]) {
    console.debug(this.formatMessage('debug', message, ...optionalParams));
  }

  verbose(message: any, ...optionalParams: any[]) {
    console.log(this.formatMessage('verbose', message, ...optionalParams));
  }

  fatal(message: any, ...optionalParams: any[]) {
    console.error(this.formatMessage('fatal', message, ...optionalParams));
  }
}
