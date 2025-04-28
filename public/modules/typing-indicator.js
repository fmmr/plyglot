/**
 * Typing Indicator
 * Manages display and animation of typing indicators
 */

class TypingIndicator {
  /**
   * Create a new TypingIndicator
   * @param {object} options - Options for the typing indicator
   * @param {HTMLElement} options.container - Container element for messages
   * @param {string} options.indicatorId - ID to use for the typing indicator element
   */
  constructor(options = {}) {
    this.container = options.container || document.getElementById('messages');
    this.indicatorId = options.indicatorId || 'typing-indicator';
    this.isVisible = false;
  }

  /**
   * Show the typing indicator
   */
  show() {
    // Don't create multiple indicators
    if (this.isVisible) return;
    
    const typingElement = document.createElement('div');
    typingElement.classList.add('typing-indicator');
    typingElement.id = this.indicatorId;
    
    // Create the bouncing dots
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      typingElement.appendChild(dot);
    }
    
    this.container.appendChild(typingElement);
    this.isVisible = true;
    
    // Auto-scroll to the indicator
    this._scrollToBottom();
    
    return typingElement;
  }

  /**
   * Hide the typing indicator
   */
  hide() {
    const typingElement = document.getElementById(this.indicatorId);
    if (typingElement) {
      typingElement.remove();
      this.isVisible = false;
    }
  }

  /**
   * Check if typing indicator is currently visible
   * @returns {boolean} Whether the indicator is visible
   */
  isShowing() {
    return this.isVisible;
  }

  /**
   * Scroll the container to the bottom
   * @private
   */
  _scrollToBottom() {
    // Use setTimeout to ensure this runs after DOM updates are complete
    setTimeout(() => {
      if (this.container) {
        this.container.scrollTop = this.container.scrollHeight;
        
        // Additional check to ensure we're at the bottom
        if (this.container.scrollTop < this.container.scrollHeight - this.container.clientHeight) {
          this.container.scrollTop = this.container.scrollHeight;
        }
      }
    }, 0);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TypingIndicator;
} else {
  window.TypingIndicator = TypingIndicator;
}