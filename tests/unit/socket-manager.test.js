/**
 * Socket Manager tests
 */

// Mocks
jest.mock('../../src/chat-history-manager');
jest.mock('../../src/translator');
jest.mock('../../src/usage-tracker');
jest.mock('../../src/logger');

const SocketManager = require('../../src/socket-manager');
const ChatHistoryManager = require('../../src/chat-history-manager');
const { processMessage, RESPONSE_MODES, INTERACTION_TYPES } = require('../../src/translator');
const { getFormattedStats } = require('../../src/usage-tracker');
const logger = require('../../src/logger');

describe('Socket Manager', () => {
  let socketManager;
  let mockIo;
  let mockSocket;
  let mockChatHistoryManager;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock socket
    mockSocket = {
      id: 'test-socket-id',
      emit: jest.fn(),
      on: jest.fn()
    };
    
    // Setup mock io
    mockIo = {
      on: jest.fn((event, callback) => {
        if (event === 'connection') {
          callback(mockSocket);
        }
      })
    };
    
    // Setup mock ChatHistoryManager instance methods
    mockChatHistoryManager = {
      initClientHistory: jest.fn(),
      getClientHistory: jest.fn().mockReturnValue([]),
      addExchange: jest.fn(),
      removeClientHistory: jest.fn()
    };
    
    // Set the mock implementation for the ChatHistoryManager constructor
    ChatHistoryManager.mockImplementation(() => mockChatHistoryManager);
    
    // Set up the mock for processMessage
    processMessage.mockResolvedValue({
      text: 'Test response',
      usage: {
        prompt_tokens: 50,
        completion_tokens: 30,
        total_tokens: 80
      }
    });
    
    // Mock getFormattedStats
    getFormattedStats.mockReturnValue({
      totalTokens: '80',
      promptTokens: '50',
      completionTokens: '30',
      translationRequests: 1,
      conversationRequests: 0,
      totalRequests: 1,
      avgTokensPerRequest: '80.0'
    });
    
    // Create the SocketManager instance
    socketManager = new SocketManager(mockIo);
  });
  
  test('should initialize ChatHistoryManager and set up event listeners on connection', () => {
    // Check that the io.on method was called with 'connection'
    expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function));
    
    // Check that ChatHistoryManager was instantiated
    expect(ChatHistoryManager).toHaveBeenCalledTimes(1);
    
    // Check that initClientHistory was called with the socket ID
    expect(mockChatHistoryManager.initClientHistory).toHaveBeenCalledWith('test-socket-id');
    
    // Check that socket.on was called for all the expected events
    expect(mockSocket.on).toHaveBeenCalledWith('chat message', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('switch mode', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('get usage stats', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('settings change', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
  });
  
  test('should handle chat message and respond', async () => {
    // Find the chat message handler
    const chatMessageHandler = findEventHandler(mockSocket.on.mock.calls, 'chat message');
    
    // Call the handler with a message
    const msgData = {
      message: 'Hello',
      targetLang: 'en',
      responseMode: 'normal',
      interactionType: 'translate'
    };
    
    await chatMessageHandler(msgData);
    
    // Check that processMessage was called with the correct arguments
    expect(processMessage).toHaveBeenCalledWith(
      'Hello',
      'en',
      'normal',
      'translate',
      []
    );
    
    // Check that socket.emit was called with the correct response
    expect(mockSocket.emit).toHaveBeenCalledWith('chat response', {
      text: 'Test response',
      usage: {
        prompt_tokens: 50,
        completion_tokens: 30,
        total_tokens: 80
      },
      stats: expect.any(Object)
    });
    
    // Verify that getFormattedStats was called
    expect(getFormattedStats).toHaveBeenCalledTimes(1);
  });
  
  test('should handle chat message for conversation mode', async () => {
    // Find the chat message handler
    const chatMessageHandler = findEventHandler(mockSocket.on.mock.calls, 'chat message');
    
    // Call the handler with a conversation message
    const msgData = {
      message: 'How are you?',
      targetLang: 'fr',
      responseMode: 'poetic',
      interactionType: 'conversation'
    };
    
    await chatMessageHandler(msgData);
    
    // Check that addExchange was called with the right arguments
    expect(mockChatHistoryManager.addExchange).toHaveBeenCalledWith(
      'test-socket-id',
      'How are you?',
      'Test response'
    );
  });
  
  test('should handle error during message processing', async () => {
    // Mock processMessage to throw an error
    processMessage.mockRejectedValueOnce(new Error('Test error'));
    
    // Find the chat message handler
    const chatMessageHandler = findEventHandler(mockSocket.on.mock.calls, 'chat message');
    
    // Call the handler with a message
    const msgData = { message: 'Hello', targetLang: 'en', responseMode: 'normal', interactionType: 'translate' };
    
    await chatMessageHandler(msgData);
    
    // Check that socket.emit was called with an error message
    expect(mockSocket.emit).toHaveBeenCalledWith('error', { message: 'Processing failed' });
    
    // Verify that logger.error was called
    expect(logger.error).toHaveBeenCalled();
  });
  
  test('should handle mode switch', () => {
    // Find the switch mode handler
    const switchModeHandler = findEventHandler(mockSocket.on.mock.calls, 'switch mode');
    
    // Call the handler
    switchModeHandler({ interactionType: 'conversation' });
    
    // Verify that logger.mode was called
    expect(logger.mode).toHaveBeenCalled();
  });
  
  test('should handle settings change', () => {
    // Find the settings change handler
    const settingsChangeHandler = findEventHandler(mockSocket.on.mock.calls, 'settings change');
    
    // Call the handler
    settingsChangeHandler({ type: 'theme', from: 'light', to: 'dark' });
    
    // Verify that logger.settings was called
    expect(logger.settings).toHaveBeenCalled();
  });
  
  test('should handle get usage stats request', () => {
    // Find the get usage stats handler
    const getUsageStatsHandler = findEventHandler(mockSocket.on.mock.calls, 'get usage stats');
    
    // Call the handler
    getUsageStatsHandler();
    
    // Verify that getFormattedStats was called
    expect(getFormattedStats).toHaveBeenCalled();
    
    // Verify that socket.emit was called with the stats
    expect(mockSocket.emit).toHaveBeenCalledWith('usage stats', expect.any(Object));
  });
  
  test('should clean up on disconnect', () => {
    // Find the disconnect handler
    const disconnectHandler = findEventHandler(mockSocket.on.mock.calls, 'disconnect');
    
    // Call the handler
    disconnectHandler();
    
    // Verify that removeClientHistory was called with the socket ID
    expect(mockChatHistoryManager.removeClientHistory).toHaveBeenCalledWith('test-socket-id');
    
    // Verify that logger.connection was called
    expect(logger.connection).toHaveBeenCalled();
  });
});

/**
 * Helper function to find event handler in mock calls
 * @param {Array} mockCalls - Mock calls array
 * @param {string} eventName - Event name to find
 * @returns {Function} The event handler function
 */
function findEventHandler(mockCalls, eventName) {
  const eventCall = mockCalls.find(call => call[0] === eventName);
  return eventCall ? eventCall[1] : null;
}