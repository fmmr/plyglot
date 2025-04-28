const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { processMessage, RESPONSE_MODES, INTERACTION_TYPES } = require('./translator');
const { getFormattedStats } = require('./usage-tracker');
require('dotenv').config();

// Configure logging
const DEBUG = process.env.DEBUG || true;

// Enhanced logging function with timestamp and categories
function log(category, message, data = null) {
  if (!DEBUG) return;
  
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${category.toUpperCase()}]`;
  
  if (data) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

// Share logging function globally so other modules can use it
global.log = log;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API endpoint for usage stats
app.get('/api/usage-stats', (req, res) => {
  res.json(getFormattedStats());
});

// Store chat history for each client
const chatHistories = {};

// Socket.io connection handling
io.on('connection', (socket) => {
  log('connection', `New client connected: ${socket.id}`);
  
  // Initialize empty chat history for this client
  chatHistories[socket.id] = [];
  
  socket.on('chat message', async (msgData) => {
    try {
      const { message, targetLang, responseMode, interactionType } = msgData;
      
      log('message', `Received message from client ${socket.id}`, {
        targetLang,
        responseMode,
        interactionType,
        messageLength: message.length
      });
      
      // Get chat history for conversation mode
      const chatHistory = chatHistories[socket.id] || [];
      
      // Process the message based on interaction type and response mode
      log('api', `Calling OpenAI API (${interactionType} mode, ${targetLang} language, ${responseMode} style)`);
      const startTime = Date.now();
      
      const processResult = await processMessage(
        message, 
        targetLang,
        responseMode || RESPONSE_MODES.normal,
        interactionType || INTERACTION_TYPES.translate,
        chatHistory
      );
      
      const apiCallDuration = Date.now() - startTime;
      
      // Extract the text response from the result
      const responseText = processResult.text;
      
      // Log the API usage
      log('api', `API call completed in ${apiCallDuration}ms`, {
        usage: processResult.usage,
        targetLang,
        mode: responseMode,
        interactionType
      });
      
      // If in conversation mode, store the interaction in chat history
      if (interactionType === INTERACTION_TYPES.conversation) {
        // Add user message to history
        chatHistories[socket.id].push({
          role: 'user',
          content: message
        });
        
        // Add assistant response to history
        chatHistories[socket.id].push({
          role: 'assistant',
          content: responseText
        });
        
        // Limit history to last 10 messages (5 exchanges)
        if (chatHistories[socket.id].length > 10) {
          chatHistories[socket.id] = chatHistories[socket.id].slice(-10);
          log('history', `Trimmed chat history for client ${socket.id} to 10 messages`);
        }
      }
      
      // Get updated usage statistics
      const usageStats = getFormattedStats();
      
      // Send the response and usage statistics to the client
      socket.emit('chat response', {
        text: responseText,
        usage: processResult.usage,
        stats: usageStats
      });
      
      log('stats', `Session usage statistics updated`, usageStats);
      
    } catch (error) {
      log('error', `Processing error for client ${socket.id}`, error);
      socket.emit('error', { message: 'Processing failed' });
    }
  });
  
  // Handle mode switching - ensure chat history is preserved even when switching modes
  socket.on('switch mode', (data) => {
    log('mode', `Client ${socket.id} switched to ${data.interactionType} mode`, data);
    // We don't need to do anything special here as the chat history is already preserved
    // by keeping the chatHistories[socket.id] intact regardless of mode changes
  });

  // Handle request for usage statistics
  socket.on('get usage stats', () => {
    log('stats', `Client ${socket.id} requested usage statistics`);
    socket.emit('usage stats', getFormattedStats());
  });

  // Handle client settings changes (language, style, theme)
  socket.on('settings change', (data) => {
    log('settings', `Client ${socket.id} changed settings`, data);
  });

  socket.on('disconnect', () => {
    log('connection', `Client disconnected: ${socket.id}`);
    // Clean up chat history when client disconnects
    delete chatHistories[socket.id];
  });
});

const PORT = process.env.PORT || 3000;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    log('server', `Plyglot server started on port ${PORT}`);
    log('server', `Available languages: ${Object.keys(require('./translator').LANGUAGES).join(', ')}`);
    log('server', `Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = { app, server };