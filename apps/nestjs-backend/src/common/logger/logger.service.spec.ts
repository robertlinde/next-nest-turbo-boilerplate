import {Test, TestingModule} from '@nestjs/testing';
import {Logger} from './logger.service'; // Adjust the import path as needed

describe('Logger', () => {
  let logger: Logger;

  // Mock console methods before each test
  beforeEach(async () => {
    // Create spies for console methods
    jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    jest.spyOn(process.stderr, 'write').mockImplementation(() => true);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [Logger],
    }).compile();

    logger = await moduleRef.resolve<Logger>(Logger);
  });

  // Restore original methods after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should be a transient-scoped instance', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [Logger],
    }).compile();

    const logger1 = await moduleRef.resolve<Logger>(Logger);
    const logger2 = await moduleRef.resolve<Logger>(Logger);

    expect(logger1).toBeInstanceOf(Logger);
    expect(logger2).toBeInstanceOf(Logger);
    expect(logger1).not.toBe(logger2); // Transient scope means different instances
  });

  describe('logging methods', () => {
    const testContext = 'TestContext';
    const testMessage = 'Test message';

    it('should log messages with proper context', () => {
      const stdoutSpy = jest.spyOn(process.stdout, 'write');

      logger.setContext(testContext);
      logger.log(testMessage);

      expect(stdoutSpy).toHaveBeenCalled();
      const output = mockToString(stdoutSpy.mock.calls);
      expect(output).toContain('LOG');
      expect(output).toContain('[TestContext]');
      expect(output).toContain('Test message');
    });

    it('should log error messages with proper context', () => {
      const stderrSpy = jest.spyOn(process.stderr, 'write');

      logger.setContext(testContext);
      logger.error(testMessage);

      expect(stderrSpy).toHaveBeenCalled();
      const output = mockToString(stderrSpy.mock.calls);
      expect(output).toContain('ERROR');
      expect(output).toContain('[TestContext]');
      expect(output).toContain('Test message');
    });

    it('should log warning messages with proper context', () => {
      const stdoutSpy = jest.spyOn(process.stdout, 'write');

      logger.setContext(testContext);
      logger.warn(testMessage);

      expect(stdoutSpy).toHaveBeenCalled();
      const output = mockToString(stdoutSpy.mock.calls);
      expect(output).toContain('WARN');
      expect(output).toContain('[TestContext]');
      expect(output).toContain('Test message');
    });

    it('should log debug messages with proper context', () => {
      const stdoutSpy = jest.spyOn(process.stdout, 'write');

      logger.setContext(testContext);
      logger.debug(testMessage);

      expect(stdoutSpy).toHaveBeenCalled();
      const output = mockToString(stdoutSpy.mock.calls);
      expect(output).toContain('DEBUG');
      expect(output).toContain('[TestContext]');
      expect(output).toContain('Test message');
    });

    it('should log verbose messages with proper context', () => {
      const stdoutSpy = jest.spyOn(process.stdout, 'write');

      logger.setContext(testContext);
      logger.verbose(testMessage);

      expect(stdoutSpy).toHaveBeenCalled();
      const output = mockToString(stdoutSpy.mock.calls);
      expect(output).toContain('VERBOSE');
      expect(output).toContain('[TestContext]');
      expect(output).toContain('Test message');
    });
  });

  describe('extended functionality', () => {
    it('should handle objects and errors correctly', () => {
      const stdoutSpy = jest.spyOn(process.stdout, 'write');
      const stderrSpy = jest.spyOn(process.stderr, 'write');

      const testObject = {key: 'value'};
      const testError = new Error('Test error');

      logger.log('Test message with object', testObject);
      logger.error('Test error', testError.stack);

      const stdoutOutput = mockToString(stdoutSpy.mock.calls);
      const stderrOutput = mockToString(stderrSpy.mock.calls);

      expect(stdoutOutput).toContain('Test message with object');
      expect(stderrOutput).toContain('Test error');
      expect(stderrOutput).toContain('Error: Test error');
    });

    it('should respect log level settings', () => {
      const stdoutSpy = jest.spyOn(process.stdout, 'write');
      const stderrSpy = jest.spyOn(process.stderr, 'write');

      // Set log level to only show errors and warnings
      logger.setLogLevels(['error', 'warn']);

      // Clear previous calls
      stdoutSpy.mockClear();
      stderrSpy.mockClear();

      logger.log('This should not be logged');
      logger.error('This should be logged');
      logger.warn('This should be logged');
      logger.debug('This should not be logged');

      const stdoutOutput = mockToString(stdoutSpy.mock.calls);
      const stderrOutput = mockToString(stderrSpy.mock.calls);

      expect(stdoutOutput).not.toContain('This should not be logged');
      expect(stdoutOutput).toContain('This should be logged'); // For warn
      expect(stderrOutput).toContain('This should be logged'); // For error
      expect(stdoutOutput).not.toContain('This should not be logged');
    });
  });
});

// Helper function to convert mock calls to string for easier testing
function mockToString(mockCalls: unknown[][]): string {
  return mockCalls
    .map((call) => {
      if (typeof call[0] === 'string') {
        return call[0];
      }

      return '';
    })
    .join('');
}
