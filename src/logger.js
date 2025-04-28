/**
 * Logger module - handles all logging functionality with color formatting
 * and consistent output formatting
 */

// Configure logging
const DEBUG = process.env.DEBUG || true;
const TEST_ENV = process.env.NODE_ENV === 'test';

/**
 * Logger class - handles all logging functionality
 */
class Logger {
  constructor() {
    // Color codes for different categories
    this.colors = {
      server: '\x1b[36m', // Cyan
      connection: '\x1b[32m', // Green
      message: '\x1b[33m', // Yellow
      api: '\x1b[35m', // Magenta
      usage: '\x1b[34m', // Blue
      stats: '\x1b[36m', // Cyan
      mode: '\x1b[33m', // Yellow
      settings: '\x1b[33m', // Yellow
      history: '\x1b[36m', // Cyan
      error: '\x1b[31m', // Red
      default: '\x1b[0m' // Reset
    };
    
    this.reset = '\x1b[0m';
    
    // Create specialized logger methods
    Object.keys(this.colors).forEach(category => {
      if (category !== 'default') {
        this[category] = (message, data) => this.log(category, message, data);
      }
    });
  }
  
  /**
   * Format log data based on category
   * @param {string} category - Log category
   * @param {object} data - Data to format
   * @returns {string} - Formatted data string
   */
  formatData(category, data) {
    if (!data) return '';
    
    switch (category) {
      case 'message':
        return `lang=${data.targetLang} mode=${data.responseMode} type=${data.interactionType} len=${data.messageLength}`;
        
      case 'api':
        if (data.usage) {
          return `tokens=${data.usage.total_tokens} (in=${data.usage.prompt_tokens}/out=${data.usage.completion_tokens})`;
        }
        break;
        
      case 'stats':
        return `total=${data.totalTokens} reqs=${data.totalRequests} avg=${data.avgTokensPerRequest}`;
        
      case 'usage':
        return `tokens=${data.totalTokens} type=${data.requestType} count=${data.requestCount}`;
        
      case 'settings':
        return `${data.type}: ${data.from} → ${data.to}`;
        
      default:
        if (typeof data === 'object') {
          // Try to extract key info from unknown objects
          const keyValues = [];
          Object.keys(data).slice(0, 3).forEach(key => {
            if (typeof data[key] !== 'object') keyValues.push(`${key}=${data[key]}`);
          });
          let result = keyValues.join(' ');
          if (Object.keys(data).length > 3) result += '...';
          return result;
        } else {
          return String(data);
        }
    }
    
    return '';
  }
  
  /**
   * Log a message with category, message, and optional data
   * @param {string} category - Log category
   * @param {string} message - Log message
   * @param {object} data - Optional data to include
   */
  log(category, message, data = null) {
    // Skip logging in test environment or if DEBUG is false
    if (TEST_ENV || !DEBUG) return;
    
    const categoryColor = this.colors[category] || this.colors.default;
    
    // Format timestamp to be shorter: HH:MM:SS
    const timestamp = new Date().toISOString().slice(11, 19);
    const prefix = `${categoryColor}[${timestamp}] [${category.toUpperCase()}]${this.reset}`;
    
    // Format data based on category
    const compactData = this.formatData(category, data);
    
    // Output log with compact data
    if (compactData) {
      console.log(`${prefix} ${message} - ${compactData}`);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }
}

// Create a singleton instance
const logger = new Logger();

// Export the logger instance
module.exports = logger;