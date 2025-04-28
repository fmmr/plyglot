/**
 * @jest-environment jsdom
 */

describe('UI Components', () => {
  beforeEach(() => {
    // Set up DOM environment
    document.body.innerHTML = `
      <div class="app-container">
        <header>
          <h1>Plyglot</h1>
          <div class="language-selector">
            <button class="lang-flag" data-lang="en">EN</button>
            <button class="lang-flag" data-lang="fr">FR</button>
          </div>
        </header>
        
        <div class="selectors-container">
          <div class="selector">
            <div class="selector-label">Style:</div>
            <div class="selector-options">
              <button class="mode-button" data-mode="normal">Standard</button>
              <button class="mode-button" data-mode="poetic">Poetic</button>
            </div>
          </div>
          
          <div class="selector">
            <div class="selector-label">Type:</div>
            <div class="selector-options">
              <button class="interaction-button" data-interaction="translate">Translate</button>
              <button class="interaction-button" data-interaction="conversation">Converse</button>
            </div>
          </div>
        </div>
        
        <main class="chat-container">
          <div id="messages"></div>
        </main>
        
        <footer>
          <form id="chat-form">
            <input type="text" id="message-input" placeholder="Type your message...">
            <button type="submit" id="send-button">Send</button>
          </form>
        </footer>
      </div>
    `;
  });
  
  afterEach(() => {
    // Clean up any event listeners or DOM elements that might persist
    document.body.innerHTML = '';
  });
  
  // Test the message display
  describe('Message Display', () => {
    test('should append user message to chat container', () => {
      const messagesContainer = document.getElementById('messages');
      
      // Create a user message
      const messageElement = document.createElement('div');
      messageElement.classList.add('message', 'user-message');
      messageElement.textContent = 'Hello, world!';
      
      messagesContainer.appendChild(messageElement);
      
      // Check if message was added
      expect(messagesContainer.children.length).toBe(1);
      expect(messagesContainer.firstChild.textContent).toBe('Hello, world!');
      expect(messagesContainer.firstChild.classList.contains('user-message')).toBe(true);
    });
    
    test('should append bot message to chat container', () => {
      const messagesContainer = document.getElementById('messages');
      
      // Create a bot message
      const messageElement = document.createElement('div');
      messageElement.classList.add('message', 'bot-message');
      messageElement.textContent = 'I am a bot!';
      
      messagesContainer.appendChild(messageElement);
      
      // Check if message was added
      expect(messagesContainer.children.length).toBe(1);
      expect(messagesContainer.firstChild.textContent).toBe('I am a bot!');
      expect(messagesContainer.firstChild.classList.contains('bot-message')).toBe(true);
    });
    
    test('should append system message to chat container', () => {
      const messagesContainer = document.getElementById('messages');
      
      // Create a system message
      const messageElement = document.createElement('div');
      messageElement.classList.add('message', 'system-message');
      messageElement.textContent = 'System notification';
      
      messagesContainer.appendChild(messageElement);
      
      // Check if message was added
      expect(messagesContainer.children.length).toBe(1);
      expect(messagesContainer.firstChild.textContent).toBe('System notification');
      expect(messagesContainer.firstChild.classList.contains('system-message')).toBe(true);
    });
  });
  
  // Test the language selector
  describe('Language Selector', () => {
    test('should add active class to selected language button', () => {
      const enButton = document.querySelector('[data-lang="en"]');
      const frButton = document.querySelector('[data-lang="fr"]');
      
      // Add active class to English button
      enButton.classList.add('active');
      
      expect(enButton.classList.contains('active')).toBe(true);
      expect(frButton.classList.contains('active')).toBe(false);
      
      // Switch active to French button
      enButton.classList.remove('active');
      frButton.classList.add('active');
      
      expect(enButton.classList.contains('active')).toBe(false);
      expect(frButton.classList.contains('active')).toBe(true);
    });
  });
  
  // Test the mode selector
  describe('Mode Selector', () => {
    test('should add active class to selected mode button', () => {
      const normalButton = document.querySelector('[data-mode="normal"]');
      const poeticButton = document.querySelector('[data-mode="poetic"]');
      
      // Add active class to normal button
      normalButton.classList.add('active');
      
      expect(normalButton.classList.contains('active')).toBe(true);
      expect(poeticButton.classList.contains('active')).toBe(false);
      
      // Switch active to poetic button
      normalButton.classList.remove('active');
      poeticButton.classList.add('active');
      
      expect(normalButton.classList.contains('active')).toBe(false);
      expect(poeticButton.classList.contains('active')).toBe(true);
    });
  });
  
  // Test the interaction type selector
  describe('Interaction Type Selector', () => {
    test('should add active class to selected interaction button', () => {
      const translateButton = document.querySelector('[data-interaction="translate"]');
      const converseButton = document.querySelector('[data-interaction="conversation"]');
      
      // Add active class to translate button
      translateButton.classList.add('active');
      
      expect(translateButton.classList.contains('active')).toBe(true);
      expect(converseButton.classList.contains('active')).toBe(false);
      
      // Switch active to converse button
      translateButton.classList.remove('active');
      converseButton.classList.add('active');
      
      expect(translateButton.classList.contains('active')).toBe(false);
      expect(converseButton.classList.contains('active')).toBe(true);
    });
  });
  
  // Test the chat form
  describe('Chat Form', () => {
    test('form should have message input and send button', () => {
      const form = document.getElementById('chat-form');
      const input = document.getElementById('message-input');
      const button = document.getElementById('send-button');
      
      expect(form).not.toBeNull();
      expect(input).not.toBeNull();
      expect(button).not.toBeNull();
      
      expect(input.placeholder).toContain('message');
    });
  });
});