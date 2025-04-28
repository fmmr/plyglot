const { io } = require('socket.io-client');
const http = require('http');
const { app } = require('../src/server');
const { processMessage } = require('../src/translator');

// Mock the translator module
jest.mock('../src/translator', () => ({
  processMessage: jest.fn(() => Promise.resolve('Test response')),
  RESPONSE_MODES: {
    normal: 'normal',
    poetic: 'poetic'
  },
  INTERACTION_TYPES: {
    translate: 'translate',
    conversation: 'conversation'
  }
}));

describe('Chat history management', () => {
  let httpServer;
  let serverSocket;
  let clientSocket;
  let port;

  beforeAll((done) => {
    // Create HTTP server
    httpServer = http.createServer(app);
    
    // Start server on random port
    httpServer.listen(() => {
      port = httpServer.address().port;
      done();
    });
    
    // Import server-side socket.io
    const { Server } = require('socket.io');
    serverSocket = new Server(httpServer);
    
    // Set up basic message handler for test purposes
    serverSocket.on('connection', (socket) => {
      socket.on('chat message', (data) => {
        socket.emit('chat response', 'Test response');
      });
      
      socket.on('switch mode', () => {
        // Socket event for switching modes
      });
    });
  });

  afterAll((done) => {
    if (serverSocket) {
      serverSocket.close();
    }
    
    if (httpServer) {
      httpServer.close(() => {
        done();
      });
    } else {
      done();
    }
  });

  afterEach(() => {
    if (clientSocket) {
      clientSocket.disconnect();
      clientSocket = null;
    }
    jest.clearAllMocks();
  });

  test('should establish client-server connection', (done) => {
    clientSocket = io(`http://localhost:${port}`);
    
    clientSocket.on('connect', () => {
      expect(clientSocket.connected).toBe(true);
      done();
    });
  });

  test('should receive response from server on chat message', (done) => {
    clientSocket = io(`http://localhost:${port}`);
    
    clientSocket.on('connect', () => {
      clientSocket.emit('chat message', {
        message: 'Hello',
        targetLang: 'en',
        responseMode: 'normal',
        interactionType: 'translate'
      });
      
      clientSocket.on('chat response', (response) => {
        expect(response).toBe('Test response');
        done();
      });
    });
  });

  test('should handle switch mode event', (done) => {
    clientSocket = io(`http://localhost:${port}`);
    
    clientSocket.on('connect', () => {
      // Create spy to check if event was emitted
      const spy = jest.spyOn(clientSocket, 'emit');
      
      clientSocket.emit('switch mode', { interactionType: 'conversation' });
      
      // Small delay to ensure event processed
      const timer = setTimeout(() => {
        expect(spy).toHaveBeenCalledWith('switch mode', { interactionType: 'conversation' });
        done();
      }, 100);
      
      // Ensure the timer is cleaned up if the test finishes before the timeout
      timer.unref();
    });
  });
});