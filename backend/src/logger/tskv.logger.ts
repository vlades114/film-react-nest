import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

/**
 * Логгер для внешних агентов сбора логов.
 * Формат TSKV (он же DSV): плоские записи вида key=value,
 * поля разделены табуляцией, записи — переносом строки.
 * Формат не поддерживает типы и вложенность — всё приводим к строке.
 *
 * Пример записи: level=log\tmessage=hello\ttimestamp=...
 */
@Injectable()
export class TskvLogger implements LoggerService {
  formatMessage(
    level: LogLevel,
    message: any,
    ...optionalParams: any[]
  ): string {
    const fields: Record<string, string> = {
      timestamp: new Date().toISOString(),
      level,
      message: this.stringify(message),
    };

    if (optionalParams.length) {
      fields.optionalParams = this.stringify(optionalParams);
    }

    return Object.entries(fields)
      .map(([key, value]) => `${this.escape(key)}=${this.escape(value)}`)
      .join('\t');
  }

  /** Приводим любое значение к плоской строке (TSKV не поддерживает типы) */
  private stringify(value: any): string {
    if (typeof value === 'string') return value;
    if (value instanceof Error) return value.stack || value.message;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  /** Экранируем служебные символы, чтобы не сломать формат записи */
  private escape(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/=/g, '\\=');
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
