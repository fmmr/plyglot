/**
 * @jest-environment jsdom
 */

// Import the ThemeManager class
const ThemeManager = require('../../../public/modules/theme-manager');

describe('ThemeManager', () => {
  // Mock localStorage
  let localStorageMock;
  
  // Mock DOM elements
  let toggleElement;
  
  // Mock callback
  let onThemeChangeMock;
  
  beforeEach(() => {
    // Setup document
    document.documentElement.removeAttribute('data-theme');
    
    // Setup localStorage mock
    localStorageMock = {
      store: {},
      getItem: jest.fn(key => localStorageMock.store[key]),
      setItem: jest.fn((key, value) => {
        localStorageMock.store[key] = value;
      }),
      clear: jest.fn(() => {
        localStorageMock.store = {};
      })
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    
    // Setup toggle element
    toggleElement = document.createElement('button');
    toggleElement.id = 'theme-toggle';
    document.body.appendChild(toggleElement);
    
    // Setup callback mock
    onThemeChangeMock = jest.fn();
    
    // Mock matchMedia
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }));
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });
  
  test('should initialize with default light theme when no preference is stored', () => {
    // Set matchMedia to return not matching for dark mode
    window.matchMedia.mockImplementation(query => ({
      matches: false,
      media: query,
      addListener: jest.fn(),
      addEventListener: jest.fn()
    }));
    
    // Initialize theme manager
    const themeManager = new ThemeManager({
      toggleElement,
      onThemeChange: onThemeChangeMock,
      storageKey: 'test-theme'
    });
    
    // Check if the theme is set to light
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    
    // Check if the theme is saved to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-theme', 'light');
  });
  
  test('should initialize with default dark theme when system prefers dark', () => {
    // Set matchMedia to return matching for dark mode
    window.matchMedia.mockImplementation(query => ({
      matches: query.includes('dark'),
      media: query,
      addListener: jest.fn(),
      addEventListener: jest.fn()
    }));
    
    // Initialize theme manager
    const themeManager = new ThemeManager({
      toggleElement,
      onThemeChange: onThemeChangeMock,
      storageKey: 'test-theme'
    });
    
    // Check if the theme is set to dark
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    
    // Check if the theme is saved to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-theme', 'dark');
  });
  
  test('should use saved theme from localStorage if available', () => {
    // Set a saved theme in localStorage
    localStorageMock.store['test-theme'] = 'dark';
    
    // Initialize theme manager
    const themeManager = new ThemeManager({
      toggleElement,
      onThemeChange: onThemeChangeMock,
      storageKey: 'test-theme'
    });
    
    // Check if the theme is set to the saved value
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
  
  test('should toggle theme when toggle button is clicked', () => {
    // Initialize with light theme
    document.documentElement.setAttribute('data-theme', 'light');
    localStorageMock.store['test-theme'] = 'light';
    
    // Initialize theme manager
    const themeManager = new ThemeManager({
      toggleElement,
      onThemeChange: onThemeChangeMock,
      storageKey: 'test-theme'
    });
    
    // Simulate button click
    toggleElement.click();
    
    // Check if the theme is toggled to dark
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-theme', 'dark');
    
    // Check if callback was called
    expect(onThemeChangeMock).toHaveBeenCalledWith('dark');
    
    // Click again to toggle back to light
    toggleElement.click();
    
    // Check if the theme is toggled back to light
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-theme', 'light');
    
    // Check if callback was called
    expect(onThemeChangeMock).toHaveBeenCalledWith('light');
  });
  
  test('should set theme directly with setTheme method', () => {
    // Initialize theme manager
    const themeManager = new ThemeManager({
      toggleElement,
      onThemeChange: onThemeChangeMock,
      storageKey: 'test-theme'
    });
    
    // Set theme directly
    themeManager.setTheme('dark');
    
    // Check if the theme is set to dark
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-theme', 'dark');
    
    // Check if callback was called
    expect(onThemeChangeMock).toHaveBeenCalledWith('dark');
  });
  
  test('should get current theme with getCurrentTheme method', () => {
    // Initialize theme manager first (this will set light theme by default)
    const themeManager = new ThemeManager({
      toggleElement,
      onThemeChange: onThemeChangeMock,
      storageKey: 'test-theme'
    });
    
    // Then explicitly set theme to dark
    document.documentElement.setAttribute('data-theme', 'dark');
    
    // Get current theme
    const currentTheme = themeManager.getCurrentTheme();
    
    // Check if the returned theme is correct
    expect(currentTheme).toBe('dark');
  });
});