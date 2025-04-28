/**
 * Logger tests
 */

// Need to do this before importing the logger
process.env.NODE_ENV = 'development'; // Override test environment for logger tests

const logger = require('../../src/logger');

describe('Logger', () => {
  let originalConsoleLog;
  let mockConsoleLog;
  let originalNodeEnv;
  
  beforeEach(() => {
    // Save original NODE_ENV
    originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development'; // Ensure logging is enabled for tests
    
    // Mock console.log
    originalConsoleLog = console.log;
    mockConsoleLog = jest.fn();
    console.log = mockConsoleLog;
  });
  
  afterEach(() => {
    // Restore console.log and NODE_ENV
    console.log = originalConsoleLog;
    process.env.NODE_ENV = originalNodeEnv;
  });
  
  test('should log a message without data', () => {
    logger.log('test', 'Test message');
    
    // Verify console.log was called
    expect(mockConsoleLog).toHaveBeenCalledTimes(1);
    
    // The first argument should contain the message
    const loggedMessage = mockConsoleLog.mock.calls[0][0];
    expect(loggedMessage).toContain('Test message');
    expect(loggedMessage).toContain('[TEST]');
  });
  
  test('should log a message with data', () => {
    const testData = { foo: 'bar', count: 42 };
    logger.log('test', 'Test message with data', testData);
    
    // Verify console.log was called
    expect(mockConsoleLog).toHaveBeenCalledTimes(1);
    
    // The log should contain the message and formatted data
    const loggedMessage = mockConsoleLog.mock.calls[0][0];
    expect(loggedMessage).toContain('Test message with data');
    expect(loggedMessage).toContain('foo=bar count=42');
  });
  
  test('should use specialized logger functions', () => {
    logger.server('Server log');
    logger.error('Error log');
    logger.api('API log');
    
    // Verify console.log was called for each specialized logger
    expect(mockConsoleLog).toHaveBeenCalledTimes(3);
    
    // Check the category is correct for each call
    expect(mockConsoleLog.mock.calls[0][0]).toContain('[SERVER]');
    expect(mockConsoleLog.mock.calls[1][0]).toContain('[ERROR]');
    expect(mockConsoleLog.mock.calls[2][0]).toContain('[API]');
  });
  
  test('should format data for different categories', () => {
    // Message category
    logger.message('Got message', {
      targetLang: 'en',
      responseMode: 'normal',
      interactionType: 'translate',
      messageLength: 10
    });
    
    // API category
    logger.api('API call', {
      usage: {
        total_tokens: 100,
        prompt_tokens: 50,
        completion_tokens: 50
      }
    });
    
    // Settings category
    logger.settings('Setting changed', {
      type: 'theme',
      from: 'light',
      to: 'dark'
    });
    
    // Verify console.log was called for each case
    expect(mockConsoleLog).toHaveBeenCalledTimes(3);
    
    // Check the data formatting for each category
    const messageLog = mockConsoleLog.mock.calls[0][0];
    expect(messageLog).toContain('lang=en mode=normal type=translate len=10');
    
    const apiLog = mockConsoleLog.mock.calls[1][0];
    expect(apiLog).toContain('tokens=100 (in=50/out=50)');
    
    const settingsLog = mockConsoleLog.mock.calls[2][0];
    expect(settingsLog).toContain('theme: light → dark');
  });
  
  test('should have color properties', () => {
    // Check if the logger has proper color properties
    expect(logger.colors).toBeDefined();
    expect(logger.colors.server).toBeDefined();
    expect(logger.colors.error).toBeDefined();
    expect(logger.reset).toBeDefined();
  });
  
  test('should not log in test environment', () => {
    // Need to reload logger module with test environment
    jest.resetModules();
    process.env.NODE_ENV = 'test';
    
    // Require a fresh instance of the logger
    const testLogger = require('../../src/logger');
    
    // Clear mock calls
    mockConsoleLog.mockClear();
    
    // Try logging
    testLogger.log('test', 'This should not be logged');
    
    // Verify console.log was NOT called
    expect(mockConsoleLog).not.toHaveBeenCalled();
  });
});