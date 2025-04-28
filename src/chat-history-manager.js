/**
 * Chat History Manager
 * Handles storing and retrieving chat history for each client
 */

const logger = require('./logger');

class ChatHistoryManager {
  constructor(maxHistoryLength = 10) {
    this.chatHistories = {};
    this.maxHistoryLength = maxHistoryLength;
    logger.server(`Chat history manager initialized with max history length: ${maxHistoryLength}`);
  }

  /**
   * Initialize a new chat history for a client
   * @param {string} clientId - The client's socket ID
   */
  initClientHistory(clientId) {
    if (!this.chatHistories[clientId]) {
      this.chatHistories[clientId] = [];
      logger.history(`Initialized empty chat history for client ${clientId}`);
    }
    return this.chatHistories[clientId];
  }

  /**
   * Get chat history for a client
   * @param {string} clientId - The client's socket ID
   * @returns {Array} The client's chat history
   */
  getClientHistory(clientId) {
    // Initialize if not exists
    this.initClientHistory(clientId);
    return this.chatHistories[clientId];
  }

  /**
   * Add a user message to chat history
   * @param {string} clientId - The client's socket ID
   * @param {string} message - The user's message
   */
  addUserMessage(clientId, message) {
    this.initClientHistory(clientId);
    this.chatHistories[clientId].push({
      role: 'user',
      content: message
    });
    this._trimHistory(clientId);
  }

  /**
   * Add an assistant (bot) message to chat history
   * @param {string} clientId - The client's socket ID
   * @param {string} message - The assistant's response
   */
  addAssistantMessage(clientId, message) {
    this.initClientHistory(clientId);
    this.chatHistories[clientId].push({
      role: 'assistant',
      content: message
    });
    this._trimHistory(clientId);
  }

  /**
   * Add both user question and assistant response as a pair
   * @param {string} clientId - The client's socket ID
   * @param {string} userMessage - The user's message
   * @param {string} assistantMessage - The assistant's response
   */
  addExchange(clientId, userMessage, assistantMessage) {
    this.addUserMessage(clientId, userMessage);
    this.addAssistantMessage(clientId, assistantMessage);
  }

  /**
   * Remove a client's chat history
   * @param {string} clientId - The client's socket ID
   */
  removeClientHistory(clientId) {
    if (this.chatHistories[clientId]) {
      delete this.chatHistories[clientId];
      logger.history(`Removed chat history for client ${clientId}`);
    }
  }

  /**
   * Get the number of exchanges for a client
   * @param {string} clientId - The client's socket ID
   * @returns {number} Number of exchanges (pairs of messages)
   */
  getExchangeCount(clientId) {
    return Math.floor((this.chatHistories[clientId]?.length || 0) / 2);
  }

  /**
   * Trim history to max length if needed
   * @private
   * @param {string} clientId - The client's socket ID
   */
  _trimHistory(clientId) {
    if (!this.chatHistories[clientId]) return;
    
    if (this.chatHistories[clientId].length > this.maxHistoryLength) {
      this.chatHistories[clientId] = this.chatHistories[clientId].slice(-this.maxHistoryLength);
      logger.history(`Trimmed chat history for client ${clientId} to ${this.maxHistoryLength} messages`);
    }
  }
}

module.exports = ChatHistoryManager;