/**
 * Message Display
 * Handles adding and formatting messages in the chat interface
 */

class MessageDisplay {
  /**
   * Create a new MessageDisplay
   * @param {object} options - Options for the message display
   * @param {HTMLElement} options.container - Container element for messages
   * @param {function} options.scrollToBottom - Function to scroll container to bottom
   */
  constructor(options = {}) {
    this.container = options.container || document.getElementById('messages');
    this.scrollToBottom = options.scrollToBottom || this._defaultScrollToBottom.bind(this);
  }

  /**
   * Add a user message to the display
   * @param {string} text - Message text
   * @param {object} options - Display options
   * @returns {HTMLElement} The created message element
   */
  addUserMessage(text, options = {}) {
    return this._addMessage(text, 'user', options);
  }

  /**
   * Add a bot message to the display
   * @param {string} text - Message text
   * @param {object} options - Display options
   * @param {boolean} options.isPoetic - Whether the message is in poetic mode
   * @param {boolean} options.isConversation - Whether the message is in conversation mode
   * @param {boolean} options.isError - Whether the message is an error
   * @returns {HTMLElement} The created message element
   */
  addBotMessage(text, options = {}) {
    const messageElement = this._addMessage(text, 'bot', options);
    
    if (options.isPoetic) {
      messageElement.classList.add('poetic-message');
    }
    
    if (options.isConversation) {
      messageElement.classList.add('conversation-message');
    }
    
    if (options.isError) {
      messageElement.classList.add('error');
    }
    
    return messageElement;
  }

  /**
   * Add a system message to the display
   * @param {string} text - Message text
   * @returns {HTMLElement} The created message element
   */
  addSystemMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'system-message');
    messageElement.textContent = text;
    this.container.appendChild(messageElement);
    this.scrollToBottom();
    return messageElement;
  }

  /**
   * Clear all messages from the display
   */
  clearMessages() {
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
  }

  /**
   * Add a message to the display
   * @private
   * @param {string} text - Message text
   * @param {string} sender - Message sender ('user' or 'bot')
   * @param {object} options - Display options
   * @returns {HTMLElement} The created message element
   */
  _addMessage(text, sender, options = {}) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
    messageElement.textContent = text;
    
    this.container.appendChild(messageElement);
    this.scrollToBottom();
    
    return messageElement;
  }

  /**
   * Default scroll to bottom implementation
   * @private
   */
  _defaultScrollToBottom() {
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
  module.exports = MessageDisplay;
} else {
  window.MessageDisplay = MessageDisplay;
}