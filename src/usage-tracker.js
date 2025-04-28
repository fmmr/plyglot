/**
 * Usage tracker for API calls
 * Tracks and stores token usage for OpenAI API calls
 */

// Initialize usage statistics
let usageStats = {
  totalTokens: 0,
  promptTokens: 0,
  completionTokens: 0,
  translationRequests: 0,
  conversationRequests: 0,
};

/**
 * Track API usage from a response
 * @param {Object} responseUsage - The usage object from OpenAI response
 * @param {string} requestType - The type of request ('translation' or 'conversation')
 */
function trackUsage(responseUsage, requestType) {
  if (!responseUsage) return;
  
  // Get old totals for logging
  const oldTotal = usageStats.totalTokens;
  const oldType = requestType === 'translation' ? 
    usageStats.translationRequests : 
    usageStats.conversationRequests;
  
  // Update token counts
  usageStats.totalTokens += responseUsage.total_tokens || 0;
  usageStats.promptTokens += responseUsage.prompt_tokens || 0;
  usageStats.completionTokens += responseUsage.completion_tokens || 0;
  
  // Update request counts
  if (requestType === 'translation') {
    usageStats.translationRequests++;
  } else if (requestType === 'conversation') {
    usageStats.conversationRequests++;
  }
  
  // Detailed logging if server has logging function
  if (global.log) {
    global.log('usage', `Tracked ${responseUsage.total_tokens} tokens for ${requestType}`, {
      totalTokens: usageStats.totalTokens,
      requestType,
      requestCount: requestType === 'translation' ? 
        usageStats.translationRequests : 
        usageStats.conversationRequests
    });
  }
}

/**
 * Get current usage statistics
 * @returns {Object} The current usage statistics
 */
function getUsageStats() {
  return {
    ...usageStats,
    totalRequests: usageStats.translationRequests + usageStats.conversationRequests
  };
}

/**
 * Reset usage statistics
 */
function resetUsageStats() {
  usageStats = {
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
    translationRequests: 0,
    conversationRequests: 0,
  };
}

/**
 * Format usage statistics for client display
 * @returns {Object} Formatted usage statistics
 */
function getFormattedStats() {
  return {
    totalTokens: usageStats.totalTokens.toLocaleString(),
    promptTokens: usageStats.promptTokens.toLocaleString(),
    completionTokens: usageStats.completionTokens.toLocaleString(),
    translationRequests: usageStats.translationRequests,
    conversationRequests: usageStats.conversationRequests,
    totalRequests: usageStats.translationRequests + usageStats.conversationRequests,
    avgTokensPerRequest: calculateAverage(
      usageStats.totalTokens,
      usageStats.translationRequests + usageStats.conversationRequests
    ),
  };
}

/**
 * Calculate average with safe division
 * @param {number} numerator 
 * @param {number} denominator 
 * @returns {string} Formatted average or "0"
 */
function calculateAverage(numerator, denominator) {
  if (!denominator) return "0";
  return (numerator / denominator).toFixed(1);
}

module.exports = {
  trackUsage,
  getUsageStats,
  resetUsageStats,
  getFormattedStats
};