/**
 * Theme Manager
 * Manages application theme (light/dark) with system preference detection
 * and local storage persistence
 */

class ThemeManager {
  /**
   * Create a new ThemeManager
   * @param {object} options - Options for theme management
   * @param {HTMLElement} options.toggleElement - The theme toggle button element
   * @param {function} options.onThemeChange - Callback function when theme changes
   * @param {string} options.storageKey - Local storage key for theme preference
   */
  constructor(options = {}) {
    this.toggleElement = options.toggleElement || document.getElementById('theme-toggle');
    this.onThemeChange = options.onThemeChange || (() => {});
    this.storageKey = options.storageKey || 'plyglot-theme';
    
    // Initialize theme based on stored preference or system setting
    this.initialize();
  }

  /**
   * Initialize theme based on user preference or system preference
   */
  initialize() {
    // Check if user preference is stored
    const savedTheme = localStorage.getItem(this.storageKey);
    
    if (savedTheme) {
      // Apply saved theme
      this.setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia && 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      this.setTheme(defaultTheme);
      localStorage.setItem(this.storageKey, defaultTheme);
    }
    
    // Set up theme toggle button event listener
    if (this.toggleElement) {
      this.toggleElement.addEventListener('click', () => this.toggleTheme());
    }
    
    // Listen for system theme changes
    this._setupSystemThemeListener();
  }

  /**
   * Get current theme
   * @returns {string} Current theme ('light' or 'dark')
   */
  getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  /**
   * Set theme
   * @param {string} theme - Theme to set ('light' or 'dark')
   */
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.storageKey, theme);
    this.onThemeChange(theme);
  }

  /**
   * Toggle between light and dark themes
   * @returns {string} The new theme
   */
  toggleTheme() {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    this.setTheme(newTheme);
    return newTheme;
  }

  /**
   * Setup listener for system theme changes
   * @private
   */
  _setupSystemThemeListener() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', e => {
          // Only apply if user hasn't set a preference
          if (!localStorage.getItem(this.storageKey)) {
            this.setTheme(e.matches ? 'dark' : 'light');
          }
        });
      } 
      // Older browsers
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(e => {
          // Only apply if user hasn't set a preference
          if (!localStorage.getItem(this.storageKey)) {
            this.setTheme(e.matches ? 'dark' : 'light');
          }
        });
      }
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
} else {
  window.ThemeManager = ThemeManager;
}