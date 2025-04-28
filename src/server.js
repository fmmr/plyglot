const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { getFormattedStats } = require('./usage-tracker');
const logger = require('./logger');
const SocketManager = require('./socket-manager');
require('dotenv').config();

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API endpoint for usage stats
app.get('/api/usage-stats', (req, res) => {
  logger.server('API request for usage stats');
  res.json(getFormattedStats());
});

// Initialize Socket.io manager
const socketManager = new SocketManager(io);

const PORT = process.env.PORT || 3000;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    const translator = require('./translator');
    logger.server(`Plyglot server started on port ${PORT}`);
    logger.server(`Available languages: ${Object.keys(translator.LANGUAGES).join(', ')}`);
    logger.server(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.server(`Models: translation=${translator.DEFAULT_MODELS.translation}, conversation=${translator.DEFAULT_MODELS.conversation}`);
  });
}

module.exports = { app, server };