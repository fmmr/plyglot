/**
 * Chat history manager tests
 */

// Mock the logger
jest.mock('../../src/logger', () => ({
  server: jest.fn(),
  history: jest.fn()
}));

const ChatHistoryManager = require('../../src/chat-history-manager');

describe('ChatHistoryManager', () => {
  let chatHistoryManager;
  
  beforeEach(() => {
    chatHistoryManager = new ChatHistoryManager();
  });
  
  test('should initialize empty chat history for a client', () => {
    const clientId = 'test-client-1';
    const history = chatHistoryManager.initClientHistory(clientId);
    
    expect(history).toEqual([]);
    expect(chatHistoryManager.chatHistories[clientId]).toEqual([]);
  });
  
  test('should get existing chat history for a client', () => {
    const clientId = 'test-client-2';
    chatHistoryManager.chatHistories[clientId] = [{ role: 'user', content: 'Hello' }];
    
    const history = chatHistoryManager.getClientHistory(clientId);
    
    expect(history).toEqual([{ role: 'user', content: 'Hello' }]);
  });
  
  test('should create history if it doesn\'t exist when getting', () => {
    const clientId = 'test-client-3';
    
    const history = chatHistoryManager.getClientHistory(clientId);
    
    expect(history).toEqual([]);
    expect(chatHistoryManager.chatHistories[clientId]).toEqual([]);
  });
  
  test('should add user message to history', () => {
    const clientId = 'test-client-4';
    const message = 'Hello, world!';
    
    chatHistoryManager.addUserMessage(clientId, message);
    
    expect(chatHistoryManager.chatHistories[clientId]).toEqual([
      { role: 'user', content: message }
    ]);
  });
  
  test('should add assistant message to history', () => {
    const clientId = 'test-client-5';
    const message = 'I am an assistant.';
    
    chatHistoryManager.addAssistantMessage(clientId, message);
    
    expect(chatHistoryManager.chatHistories[clientId]).toEqual([
      { role: 'assistant', content: message }
    ]);
  });
  
  test('should add exchange (user and assistant messages)', () => {
    const clientId = 'test-client-6';
    const userMessage = 'How are you?';
    const assistantMessage = 'I am doing well!';
    
    chatHistoryManager.addExchange(clientId, userMessage, assistantMessage);
    
    expect(chatHistoryManager.chatHistories[clientId]).toEqual([
      { role: 'user', content: userMessage },
      { role: 'assistant', content: assistantMessage }
    ]);
  });
  
  test('should remove client history', () => {
    const clientId = 'test-client-7';
    chatHistoryManager.chatHistories[clientId] = [{ role: 'user', content: 'Test' }];
    
    chatHistoryManager.removeClientHistory(clientId);
    
    expect(chatHistoryManager.chatHistories[clientId]).toBeUndefined();
  });
  
  test('should get exchange count', () => {
    const clientId = 'test-client-8';
    
    // Empty history
    expect(chatHistoryManager.getExchangeCount(clientId)).toBe(0);
    
    // Add one message (no complete exchange)
    chatHistoryManager.addUserMessage(clientId, 'Hello');
    expect(chatHistoryManager.getExchangeCount(clientId)).toBe(0);
    
    // Add second message (one complete exchange)
    chatHistoryManager.addAssistantMessage(clientId, 'Hi there');
    expect(chatHistoryManager.getExchangeCount(clientId)).toBe(1);
    
    // Add two more messages (two complete exchanges)
    chatHistoryManager.addUserMessage(clientId, 'How are you?');
    chatHistoryManager.addAssistantMessage(clientId, 'I am well');
    expect(chatHistoryManager.getExchangeCount(clientId)).toBe(2);
  });
  
  test('should trim history to max length', () => {
    const clientId = 'test-client-9';
    const maxLength = 4;
    const customManager = new ChatHistoryManager(maxLength);
    
    // Add 6 messages (exceeds maxLength of 4)
    customManager.addUserMessage(clientId, 'Message 1');
    customManager.addAssistantMessage(clientId, 'Response 1');
    customManager.addUserMessage(clientId, 'Message 2');
    customManager.addAssistantMessage(clientId, 'Response 2');
    customManager.addUserMessage(clientId, 'Message 3');
    customManager.addAssistantMessage(clientId, 'Response 3');
    
    // Check that history is trimmed to last 4 messages
    expect(customManager.chatHistories[clientId].length).toBe(maxLength);
    expect(customManager.chatHistories[clientId][0]).toEqual({ role: 'user', content: 'Message 2' });
    expect(customManager.chatHistories[clientId][1]).toEqual({ role: 'assistant', content: 'Response 2' });
    expect(customManager.chatHistories[clientId][2]).toEqual({ role: 'user', content: 'Message 3' });
    expect(customManager.chatHistories[clientId][3]).toEqual({ role: 'assistant', content: 'Response 3' });
  });
});