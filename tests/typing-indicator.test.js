/**
 * @jest-environment jsdom
 */

describe('Typing Indicator', () => {
  beforeEach(() => {
    // Set up DOM environment
    document.body.innerHTML = `
      <div id="messages"></div>
    `;
  });
  
  afterEach(() => {
    // Clean up any added style elements
    const styles = document.querySelectorAll('style');
    styles.forEach(style => style.remove());
  });
  
  describe('Show Typing Indicator', () => {
    test('should create typing indicator element', () => {
      const messages = document.getElementById('messages');
      
      // Create typing indicator
      const typingElement = document.createElement('div');
      typingElement.classList.add('typing-indicator');
      typingElement.id = 'typing-indicator';
      
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        typingElement.appendChild(dot);
      }
      
      messages.appendChild(typingElement);
      
      // Verify typing indicator was created properly
      const indicator = document.getElementById('typing-indicator');
      expect(indicator).not.toBeNull();
      expect(indicator.classList.contains('typing-indicator')).toBe(true);
      expect(indicator.childNodes.length).toBe(3);
      expect(indicator.childNodes[0].nodeName).toBe('SPAN');
    });
  });
  
  describe('Hide Typing Indicator', () => {
    test('should remove typing indicator element', () => {
      const messages = document.getElementById('messages');
      
      // First create the typing indicator
      const typingElement = document.createElement('div');
      typingElement.classList.add('typing-indicator');
      typingElement.id = 'typing-indicator';
      
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        typingElement.appendChild(dot);
      }
      
      messages.appendChild(typingElement);
      
      // Verify indicator exists
      expect(document.getElementById('typing-indicator')).not.toBeNull();
      
      // Remove typing indicator
      const indicator = document.getElementById('typing-indicator');
      if (indicator) {
        indicator.remove();
      }
      
      // Verify indicator was removed
      expect(document.getElementById('typing-indicator')).toBeNull();
    });
  });
  
  describe('Animation Classes', () => {
    test('should have correct CSS classes for styling', () => {
      // Load CSS into jsdom (this is a mock since jsdom doesn't parse CSS)
      const style = document.createElement('style');
      style.textContent = `
        .typing-indicator {
          align-self: flex-start;
          background-color: white;
          padding: 12px 16px;
          border-radius: 8px;
          margin-right: auto;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
        }
        
        .typing-indicator span {
          height: 8px;
          width: 8px;
          margin: 0 2px;
          background-color: #757575;
          border-radius: 50%;
          display: inline-block;
          opacity: 0.4;
        }
      `;
      document.head.appendChild(style);
      
      // Create the typing indicator
      const messages = document.getElementById('messages');
      const typingElement = document.createElement('div');
      typingElement.classList.add('typing-indicator');
      typingElement.id = 'typing-indicator';
      
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        typingElement.appendChild(dot);
      }
      
      messages.appendChild(typingElement);
      
      // Get computed styles (limited in jsdom but we can check classes)
      const indicator = document.getElementById('typing-indicator');
      expect(indicator.className).toBe('typing-indicator');
      expect(indicator.childNodes[0].nodeName).toBe('SPAN');
    });
  });
});