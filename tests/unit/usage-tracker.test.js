/**
 * Usage tracker tests
 */

// Mock the global logger
global.log = jest.fn();

const { trackUsage, getUsageStats, resetUsageStats, getFormattedStats } = require('../../src/usage-tracker');

describe('Usage Tracker', () => {
  beforeEach(() => {
    // Reset stats before each test
    resetUsageStats();
    global.log.mockClear();
  });
  
  test('should track usage for translation request', () => {
    const usage = {
      prompt_tokens: 50,
      completion_tokens: 30,
      total_tokens: 80
    };
    
    trackUsage(usage, 'translation');
    
    const stats = getUsageStats();
    expect(stats.totalTokens).toBe(80);
    expect(stats.promptTokens).toBe(50);
    expect(stats.completionTokens).toBe(30);
    expect(stats.translationRequests).toBe(1);
    expect(stats.conversationRequests).toBe(0);
    expect(stats.totalRequests).toBe(1);
  });
  
  test('should track usage for conversation request', () => {
    const usage = {
      prompt_tokens: 100,
      completion_tokens: 70,
      total_tokens: 170
    };
    
    trackUsage(usage, 'conversation');
    
    const stats = getUsageStats();
    expect(stats.totalTokens).toBe(170);
    expect(stats.promptTokens).toBe(100);
    expect(stats.completionTokens).toBe(70);
    expect(stats.translationRequests).toBe(0);
    expect(stats.conversationRequests).toBe(1);
    expect(stats.totalRequests).toBe(1);
  });
  
  test('should accumulate usage across multiple requests', () => {
    // First request (translation)
    trackUsage({
      prompt_tokens: 40,
      completion_tokens: 20,
      total_tokens: 60
    }, 'translation');
    
    // Second request (translation)
    trackUsage({
      prompt_tokens: 30,
      completion_tokens: 15,
      total_tokens: 45
    }, 'translation');
    
    // Third request (conversation)
    trackUsage({
      prompt_tokens: 80,
      completion_tokens: 60,
      total_tokens: 140
    }, 'conversation');
    
    const stats = getUsageStats();
    expect(stats.totalTokens).toBe(245); // 60 + 45 + 140
    expect(stats.promptTokens).toBe(150); // 40 + 30 + 80
    expect(stats.completionTokens).toBe(95); // 20 + 15 + 60
    expect(stats.translationRequests).toBe(2);
    expect(stats.conversationRequests).toBe(1);
    expect(stats.totalRequests).toBe(3);
  });
  
  test('should handle missing usage data', () => {
    // Call with undefined
    trackUsage(undefined, 'translation');
    
    // Stats should remain at default values
    const stats = getUsageStats();
    expect(stats.totalTokens).toBe(0);
    expect(stats.translationRequests).toBe(0);
  });
  
  test('should format stats for client display', () => {
    // Add some usage
    trackUsage({
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150
    }, 'translation');
    
    trackUsage({
      prompt_tokens: 200,
      completion_tokens: 100,
      total_tokens: 300
    }, 'conversation');
    
    const formattedStats = getFormattedStats();
    
    // Check that values are formatted as strings
    expect(formattedStats.totalTokens).toBe('450');
    expect(formattedStats.promptTokens).toBe('300');
    expect(formattedStats.completionTokens).toBe('150');
    
    // Check that request counts are still numbers
    expect(formattedStats.translationRequests).toBe(1);
    expect(formattedStats.conversationRequests).toBe(1);
    expect(formattedStats.totalRequests).toBe(2);
    
    // Check average is calculated correctly and formatted as string
    expect(formattedStats.avgTokensPerRequest).toBe('225.0');
  });
  
  test('should handle zero requests when calculating average', () => {
    // No usage tracked
    const formattedStats = getFormattedStats();
    
    // Average should be "0" not NaN
    expect(formattedStats.avgTokensPerRequest).toBe('0');
  });
  
  test('should reset usage stats', () => {
    // Track some usage
    trackUsage({
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150
    }, 'translation');
    
    // Check that stats are non-zero
    const beforeReset = getUsageStats();
    expect(beforeReset.totalTokens).toBe(150);
    
    // Reset stats
    resetUsageStats();
    
    // Check that stats are reset to zero
    const afterReset = getUsageStats();
    expect(afterReset.totalTokens).toBe(0);
    expect(afterReset.promptTokens).toBe(0);
    expect(afterReset.completionTokens).toBe(0);
    expect(afterReset.translationRequests).toBe(0);
    expect(afterReset.conversationRequests).toBe(0);
  });
  
  test('should log usage when global.log is available', () => {
    const usage = {
      prompt_tokens: 50,
      completion_tokens: 30,
      total_tokens: 80
    };
    
    trackUsage(usage, 'translation');
    
    // Verify global.log was called
    expect(global.log).toHaveBeenCalledTimes(1);
    expect(global.log).toHaveBeenCalledWith('usage', expect.stringContaining('Tracked 80 tokens'), expect.any(Object));
  });
});