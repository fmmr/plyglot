/**
 * Socket Manager
 * Handles Socket.io connection and message processing
 */

const ChatHistoryManager = require('./chat-history-manager');
const { processMessage, RESPONSE_MODES, INTERACTION_TYPES } = require('./translator');
const { getFormattedStats } = require('./usage-tracker');
const logger = require('./logger');

class SocketManager {
  /**
   * Create a new SocketManager
   * @param {object} io - The Socket.io instance
   */
  constructor(io) {
    this.io = io;
    this.chatHistoryManager = new ChatHistoryManager();
    this.initialize();
    logger.server('Socket manager initialized');
  }

  /**
   * Initialize Socket.io event listeners
   */
  initialize() {
    this.io.on('connection', (socket) => {
      this._handleNewConnection(socket);

      // Set up event handlers
      socket.on('chat message', (msgData) => this._handleChatMessage(socket, msgData));
      socket.on('switch mode', (data) => this._handleModeSwitch(socket, data));
      socket.on('get usage stats', () => this._handleGetUsageStats(socket));
      socket.on('settings change', (data) => this._handleSettingsChange(socket, data));
      socket.on('disconnect', () => this._handleDisconnect(socket));
    });
  }

  /**
   * Handle new client connection
   * @private
   * @param {object} socket - The Socket.io socket object
   */
  _handleNewConnection(socket) {
    logger.connection(`New client connected: ${socket.id}`);
    this.chatHistoryManager.initClientHistory(socket.id);
  }

  /**
   * Handle chat message from client
   * @private
   * @param {object} socket - The Socket.io socket object
   * @param {object} msgData - Message data from client
   */
  async _handleChatMessage(socket, msgData) {
    try {
      const { message, targetLang, responseMode, interactionType, model } = msgData;
      
      logger.message(`Received message from client ${socket.id}`, {
        targetLang,
        responseMode,
        interactionType,
        model: model || 'default',
        messageLength: message.length
      });
      
      // Get chat history for conversation mode
      const chatHistory = this.chatHistoryManager.getClientHistory(socket.id);
      
      // Process the message based on interaction type and response mode
      logger.api(`Calling OpenAI API (${interactionType} mode, ${targetLang} language, ${responseMode} style, ${model || 'default'} model)`);
      const startTime = Date.now();
      
      const processResult = await processMessage(
        message, 
        targetLang,
        responseMode || RESPONSE_MODES.normal,
        interactionType || INTERACTION_TYPES.translate,
        chatHistory,
        model
      );
      
      const apiCallDuration = Date.now() - startTime;
      
      // Extract the text response from the result
      const responseText = processResult.text;
      
      // Log the API usage
      logger.api(`API call completed in ${apiCallDuration}ms`, {
        usage: processResult.usage
      });
      
      // If in conversation mode, store the interaction in chat history
      if (interactionType === INTERACTION_TYPES.conversation) {
        this.chatHistoryManager.addExchange(socket.id, message, responseText);
      }
      
      // Get updated usage statistics
      const usageStats = getFormattedStats();
      
      // Send the response and usage statistics to the client
      socket.emit('chat response', {
        text: responseText,
        usage: processResult.usage,
        stats: usageStats
      });
      
      logger.stats(`Session usage statistics updated`, {
        totalTokens: usageStats.totalTokens,
        totalRequests: usageStats.translationRequests + usageStats.conversationRequests,
        avgTokensPerRequest: parseFloat((usageStats.totalTokens / (usageStats.translationRequests + usageStats.conversationRequests)).toFixed(1))
      });
      
    } catch (error) {
      logger.error(`Processing error for client ${socket.id}`, error);
      socket.emit('error', { message: 'Processing failed' });
    }
  }

  /**
   * Handle mode switch from client
   * @private
   * @param {object} socket - The Socket.io socket object
   * @param {object} data - Mode switch data
   */
  _handleModeSwitch(socket, data) {
    logger.mode(`Client ${socket.id} switched to ${data.interactionType} mode`, data);
    // We don't need to do anything special here as the chat history is already preserved
    // by the ChatHistoryManager regardless of mode changes
  }

  /**
   * Handle usage stats request from client
   * @private
   * @param {object} socket - The Socket.io socket object
   */
  _handleGetUsageStats(socket) {
    logger.stats(`Client ${socket.id} requested usage statistics`);
    socket.emit('usage stats', getFormattedStats());
  }

  /**
   * Handle settings change from client
   * @private
   * @param {object} socket - The Socket.io socket object
   * @param {object} data - Settings data
   */
  _handleSettingsChange(socket, data) {
    logger.settings(`Client ${socket.id} changed settings`, data);
  }

  /**
   * Handle client disconnect
   * @private
   * @param {object} socket - The Socket.io socket object
   */
  _handleDisconnect(socket) {
    logger.connection(`Client disconnected: ${socket.id}`);
    this.chatHistoryManager.removeClientHistory(socket.id);
  }
}

module.exports = SocketManager;