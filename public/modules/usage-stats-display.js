/**
 * Usage Stats Display
 * Manages display of API usage statistics
 */

class UsageStatsDisplay {
  /**
   * Create a new UsageStatsDisplay
   * @param {object} options - Options for the usage stats display
   * @param {HTMLElement} options.container - Container element for the app
   * @param {string} options.containerId - ID to use for the stats container
   */
  constructor(options = {}) {
    this.appContainer = options.container || document.querySelector('.app-container');
    this.containerId = options.containerId || 'usage-stats';
    this.initialize();
  }

  /**
   * Initialize the usage stats display
   */
  initialize() {
    // Create usage stats container if it doesn't exist
    let statsContainer = document.getElementById(this.containerId);
    
    if (!statsContainer) {
      // Create usage stats container
      statsContainer = document.createElement('div');
      statsContainer.id = this.containerId;
      statsContainer.classList.add('usage-stats');
      
      // Create toggle button
      const toggleButton = document.createElement('button');
      toggleButton.id = 'stats-toggle';
      toggleButton.classList.add('stats-toggle');
      toggleButton.textContent = 'API Usage';
      toggleButton.addEventListener('click', () => {
        statsContainer.classList.toggle('expanded');
      });
      
      // Create stats content container
      const statsContent = document.createElement('div');
      statsContent.id = 'stats-content';
      statsContent.classList.add('stats-content');
      
      // Add elements to DOM
      statsContainer.appendChild(toggleButton);
      statsContainer.appendChild(statsContent);
      this.appContainer.appendChild(statsContainer);
    }
  }

  /**
   * Update the usage statistics display
   * @param {object} globalStats - Global usage statistics
   * @param {object} lastRequestStats - Statistics for the last request
   */
  update(globalStats, lastRequestStats = null) {
    const statsContent = document.getElementById('stats-content');
    if (!statsContent) return;
    
    // Format the statistics HTML
    let statsHTML = `
      <div class="stats-section">
        <h3>Session Totals</h3>
        <p>Total Requests: ${globalStats.totalRequests}</p>
        <p>Total Tokens: ${globalStats.totalTokens}</p>
        <p>Input Tokens: ${globalStats.promptTokens}</p>
        <p>Output Tokens: ${globalStats.completionTokens}</p>
        <p>Avg Tokens/Request: ${globalStats.avgTokensPerRequest}</p>
      </div>
      <div class="stats-section">
        <h3>By Type</h3>
        <p>Translations: ${globalStats.translationRequests}</p>
        <p>Conversations: ${globalStats.conversationRequests}</p>
      </div>
    `;
    
    // Add last request info if available
    if (lastRequestStats) {
      statsHTML += `
        <div class="stats-section">
          <h3>Last Request</h3>
          <p>Total: ${lastRequestStats.total_tokens} tokens</p>
          <p>Input: ${lastRequestStats.prompt_tokens} tokens</p>
          <p>Output: ${lastRequestStats.completion_tokens} tokens</p>
        </div>
      `;
    }
    
    statsContent.innerHTML = statsHTML;
  }

  /**
   * Expand the usage stats display
   */
  expand() {
    const statsContainer = document.getElementById(this.containerId);
    if (statsContainer) {
      statsContainer.classList.add('expanded');
    }
  }

  /**
   * Collapse the usage stats display
   */
  collapse() {
    const statsContainer = document.getElementById(this.containerId);
    if (statsContainer) {
      statsContainer.classList.remove('expanded');
    }
  }

  /**
   * Toggle the expanded state of the usage stats display
   */
  toggle() {
    const statsContainer = document.getElementById(this.containerId);
    if (statsContainer) {
      statsContainer.classList.toggle('expanded');
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UsageStatsDisplay;
} else {
  window.UsageStatsDisplay = UsageStatsDisplay;
}