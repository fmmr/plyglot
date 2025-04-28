/**
 * Socket Client
 * Manages communication with the server via Socket.io
 */

class SocketClient {
  /**
   * Create a new SocketClient
   * @param {object} options - Options for the socket client
   * @param {object} options.callbacks - Callback functions for socket events
   * @param {function} options.callbacks.onChatResponse - Called when a chat response is received
   * @param {function} options.callbacks.onError - Called when an error occurs
   * @param {function} options.callbacks.onUsageStats - Called when usage stats are received
   */
  constructor(options = {}) {
    this.socket = io();
    this.callbacks = options.callbacks || {};
    this.initialize();
  }

  /**
   * Initialize socket event listeners
   */
  initialize() {
    // Set up event listeners
    this.socket.on('chat response', (response) => {
      if (this.callbacks.onChatResponse) {
        this.callbacks.onChatResponse(response);
      }
    });

    this.socket.on('error', (error) => {
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    });

    this.socket.on('usage stats', (stats) => {
      if (this.callbacks.onUsageStats) {
        this.callbacks.onUsageStats(stats);
      }
    });
  }

  /**
   * Send a chat message to the server
   * @param {object} messageData - Message data
   * @param {string} messageData.message - The message text
   * @param {string} messageData.targetLang - Target language code
   * @param {string} messageData.responseMode - Response mode (normal, poetic)
   * @param {string} messageData.interactionType - Interaction type (translate, conversation)
   */
  sendChatMessage(messageData) {
    this.socket.emit('chat message', messageData);
  }

  /**
   * Switch interaction mode
   * @param {string} interactionType - The interaction type to switch to
   */
  switchMode(interactionType) {
    this.socket.emit('switch mode', { interactionType });
  }

  /**
   * Request usage statistics from the server
   */
  requestUsageStats() {
    this.socket.emit('get usage stats');
  }

  /**
   * Notify server about settings changes
   * @param {object} settingsData - Settings data
   * @param {string} settingsData.type - Type of setting (language, style, theme)
   * @param {string} settingsData.from - Previous value
   * @param {string} settingsData.to - New value
   */
  notifySettingsChange(settingsData) {
    settingsData.timestamp = new Date().toISOString();
    this.socket.emit('settings change', settingsData);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SocketClient;
} else {
  window.SocketClient = SocketClient;
}