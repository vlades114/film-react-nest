import { JsonLogger } from './json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;

  beforeEach(() => {
    logger = new JsonLogger();
  });

  describe('formatMessage', () => {
    it('форматирует запись в валидный JSON с полями level, message и timestamp', () => {
      const result = logger.formatMessage('log', 'hello world');
      const parsed = JSON.parse(result);

      expect(parsed.level).toBe('log');
      expect(parsed.message).toBe('hello world');
      expect(typeof parsed.timestamp).toBe('string');
      expect(new Date(parsed.timestamp).toString()).not.toBe('Invalid Date');
    });

    it('включает optionalParams в результат, если они переданы', () => {
      const result = logger.formatMessage('log', 'ctx', { userId: 42 }, 'extra');
      const parsed = JSON.parse(result);

      expect(parsed.optionalParams).toEqual([{ userId: 42 }, 'extra']);
    });

    it('не добавляет optionalParams в результат, если они не переданы', () => {
      const result = logger.formatMessage('log', 'no extra params');
      const parsed = JSON.parse(result);

      expect(parsed.optionalParams).toBeUndefined();
    });

    it('корректно сериализует ошибку в message', () => {
      const error = new Error('something failed');
      const result = logger.formatMessage('error', error);
      const parsed = JSON.parse(result);

      expect(parsed.message.name).toBe('Error');
      expect(parsed.message.message).toBe('something failed');
      expect(parsed.message.stack).toContain('Error: something failed');
    });
  });

  describe('методы уровня логирования', () => {
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('log() пишет отформатированное сообщение с level=log в console.log', () => {
      logger.log('regular message');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('log');
      expect(parsed.message).toBe('regular message');
    });

    it('error() пишет отформатированное сообщение с level=error в console.error', () => {
      logger.error('boom');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('error');
    });

    it('warn() пишет отформатированное сообщение с level=warn в console.warn', () => {
      logger.warn('careful');

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('warn');
    });
  });
});
