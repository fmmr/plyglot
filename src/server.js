const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { processMessage, RESPONSE_MODES, INTERACTION_TYPES } = require('./translator');
const { getFormattedStats } = require('./usage-tracker');
require('dotenv').config();

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
  console.log('New client connected');
  
  // Initialize empty chat history for this client
  chatHistories[socket.id] = [];
  
  socket.on('chat message', async (msgData) => {
    try {
      const { message, targetLang, responseMode, interactionType } = msgData;
      
      // Get chat history for conversation mode
      const chatHistory = chatHistories[socket.id] || [];
      
      // Process the message based on interaction type and response mode
      const processResult = await processMessage(
        message, 
        targetLang,
        responseMode || RESPONSE_MODES.normal,
        interactionType || INTERACTION_TYPES.translate,
        chatHistory
      );
      
      // Extract the text response from the result
      const responseText = processResult.text;
      
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
    } catch (error) {
      console.error('Processing error:', error);
      socket.emit('error', { message: 'Processing failed' });
    }
  });
  
  // Handle mode switching - ensure chat history is preserved even when switching modes
  socket.on('switch mode', (data) => {
    console.log(`Client ${socket.id} switched to ${data.interactionType} mode`);
    // We don't need to do anything special here as the chat history is already preserved
    // by keeping the chatHistories[socket.id] intact regardless of mode changes
  });

  // Handle request for usage statistics
  socket.on('get usage stats', () => {
    socket.emit('usage stats', getFormattedStats());
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    // Clean up chat history when client disconnects
    delete chatHistories[socket.id];
  });
});

const PORT = process.env.PORT || 3000;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = { app, server };