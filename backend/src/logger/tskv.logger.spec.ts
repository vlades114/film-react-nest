import { TskvLogger } from './tskv.logger';

/** Разбирает TSKV-строку обратно в объект — удобно для проверок в тестах */
function parseTskv(line: string): Record<string, string> {
  return Object.fromEntries(
    line.split('\t').map((pair) => {
      const [key, ...rest] = pair.split('=');
      return [key, rest.join('=')];
    }),
  );
}

describe('TskvLogger', () => {
  let logger: TskvLogger;

  beforeEach(() => {
    logger = new TskvLogger();
  });

  describe('formatMessage', () => {
    it('разделяет поля табуляцией в формате key=value', () => {
      const result = logger.formatMessage('log', 'hello');
      const fields = result.split('\t');

      expect(fields.length).toBeGreaterThan(1);
      fields.forEach((field) => {
        expect(field).toMatch(/^[^=]+=/);
      });
    });

    it('содержит level и message среди полей записи', () => {
      const result = logger.formatMessage('warn', 'careful');
      const parsed = parseTskv(result);

      expect(parsed.level).toBe('warn');
      expect(parsed.message).toBe('careful');
      expect(parsed.timestamp).toBeDefined();
    });

    it('экранирует табуляцию и перенос строки внутри значения', () => {
      const result = logger.formatMessage('log', 'line1\nline2\tend');

      // вся запись должна остаться в одну строку без сырых \t и \n
      expect(result.split('\n').length).toBe(1);
      expect(result).toContain('message=line1\\nline2\\tend');
    });

    it('сериализует optionalParams в строку', () => {
      const result = logger.formatMessage('log', 'ctx', { userId: 1 });
      const parsed = parseTskv(result);

      expect(parsed.optionalParams).toContain('userId');
    });

    it('не добавляет поле optionalParams, если параметры не переданы', () => {
      const result = logger.formatMessage('log', 'no extra params');

      expect(result).not.toContain('optionalParams=');
    });
  });

  describe('методы уровня логирования', () => {
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('log() пишет TSKV-строку с level=log в console.log', () => {
      logger.log('test message');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const parsed = parseTskv(consoleLogSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('log');
      expect(parsed.message).toBe('test message');
    });

    it('error() пишет TSKV-строку с level=error в console.error', () => {
      logger.error('boom');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const parsed = parseTskv(consoleErrorSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('error');
    });
  });
});
