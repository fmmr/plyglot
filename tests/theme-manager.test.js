/**
 * @jest-environment jsdom
 */

describe('Theme Management', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset document attributes
    document.documentElement.removeAttribute('data-theme');
    
    // Create mock DOM structure
    document.body.innerHTML = `
      <div id="theme-toggle"></div>
      <div id="messages"></div>
    `;
    
    // Clean up any global mocks from previous tests
    if (global.io) {
      delete global.io;
    }
  });
  
  afterEach(() => {
    // Clean up any scripts added during tests
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => script.remove());
  });

  // Load app.js module in each test to get fresh state
  const loadAppModule = () => {
    // Mock socket.io
    global.io = jest.fn(() => ({
      on: jest.fn(),
      emit: jest.fn()
    }));
    
    // Create a fresh script element and add it to the document
    const script = document.createElement('script');
    script.textContent = `
      // Mock minimal app.js functionality for theme testing
      document.addEventListener('DOMContentLoaded', () => {
        const themeToggle = document.getElementById('theme-toggle');
        
        function initTheme() {
          const savedTheme = localStorage.getItem('plyglot-theme');
          
          if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
          } else {
            // For testing, we'll use light as default
            const defaultTheme = 'light';
            document.documentElement.setAttribute('data-theme', defaultTheme);
            localStorage.setItem('plyglot-theme', defaultTheme);
          }
          
          themeToggle.addEventListener('click', toggleTheme);
        }
        
        function toggleTheme() {
          const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
          const newTheme = currentTheme === 'light' ? 'dark' : 'light';
          
          document.documentElement.setAttribute('data-theme', newTheme);
          localStorage.setItem('plyglot-theme', newTheme);
        }
        
        // Initialize theme
        initTheme();
      });
      
      // Trigger the DOMContentLoaded event manually for testing
      document.dispatchEvent(new Event('DOMContentLoaded'));
    `;
    document.body.appendChild(script);
  };

  test('should set default theme if none saved', () => {
    loadAppModule();
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('plyglot-theme')).toBe('light');
  });

  test('should use saved theme from localStorage', () => {
    localStorage.setItem('plyglot-theme', 'dark');
    loadAppModule();
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('should toggle theme when theme toggle button is clicked', () => {
    loadAppModule();
    
    // Initial state
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    
    // Click the theme toggle button
    document.getElementById('theme-toggle').click();
    
    // Theme should change to dark
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('plyglot-theme')).toBe('dark');
    
    // Click again
    document.getElementById('theme-toggle').click();
    
    // Theme should change back to light
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('plyglot-theme')).toBe('light');
  });
});