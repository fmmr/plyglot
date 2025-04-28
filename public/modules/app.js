/**
 * Main Application
 * Coordinates all modules and handles user input
 */

class App {
  /**
   * Create a new App instance
   */
  constructor() {
    // DOM Elements
    this.form = document.getElementById('chat-form');
    this.input = document.getElementById('message-input');
    this.messages = document.getElementById('messages');
    this.langButtons = document.querySelectorAll('.lang-flag');
    this.modeButtons = document.querySelectorAll('.mode-button');
    this.interactionButtons = document.querySelectorAll('.interaction-button');
    this.themeToggle = document.getElementById('theme-toggle');
    this.modelSelector = document.getElementById('model-selector');
    
    // State
    this.selectedLang = 'en'; // Default language
    this.selectedMode = 'normal'; // Default mode
    this.selectedInteraction = 'conversation'; // Default interaction type
    this.selectedModel = this.modelSelector ? this.modelSelector.value : 'gpt-4'; // Default model
    
    // Initialize modules
    this.initializeModules();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Set initial UI state
    this.initializeUI();
  }

  /**
   * Initialize all modules
   */
  initializeModules() {
    // Message display for chat messages
    this.messageDisplay = new MessageDisplay({
      container: this.messages,
      scrollToBottom: this.scrollToBottom.bind(this)
    });
    
    // Typing indicator for pending responses
    this.typingIndicator = new TypingIndicator({
      container: this.messages
    });
    
    // Theme manager for dark/light mode
    this.themeManager = new ThemeManager({
      toggleElement: this.themeToggle,
      onThemeChange: this.handleThemeChange.bind(this)
    });
    
    // Socket client for server communication
    this.socketClient = new SocketClient({
      callbacks: {
        onChatResponse: this.handleChatResponse.bind(this),
        onError: this.handleError.bind(this),
        onUsageStats: this.handleUsageStats.bind(this)
      }
    });
    
    // Usage stats display
    this.usageStatsDisplay = new UsageStatsDisplay();
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Form submission
    this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
    
    // Language selection
    this.langButtons.forEach(button => {
      button.addEventListener('click', this.handleLanguageChange.bind(this, button));
    });
    
    // Mode selection (Standard/Poetic)
    this.modeButtons.forEach(button => {
      button.addEventListener('click', this.handleModeChange.bind(this, button));
    });
    
    // Interaction type selection (Translate/Converse)
    this.interactionButtons.forEach(button => {
      button.addEventListener('click', this.handleInteractionChange.bind(this, button));
    });
    
    // Model selection
    if (this.modelSelector) {
      this.modelSelector.addEventListener('change', this.handleModelChange.bind(this));
    }
  }

  /**
   * Initialize UI state
   */
  initializeUI() {
    // Set initial active language
    document.querySelector(`[data-lang="${this.selectedLang}"]`).classList.add('active');
    
    // Add startup welcome message
    this.messageDisplay.addSystemMessage("Welcome to Plyglot! Using CONVERSE mode by default. Select a language and start chatting.");
    
    // Inform server of default conversation mode
    this.socketClient.switchMode('conversation');
    
    // Request initial usage stats
    this.socketClient.requestUsageStats();
  }

  /**
   * Handle form submission (sending a message)
   * @param {Event} e - Submit event
   */
  handleFormSubmit(e) {
    e.preventDefault();
    
    if (this.input.value.trim()) {
      this.sendMessage(this.input.value);
    }
  }

  /**
   * Send a message to the server
   * @param {string} text - Message text
   */
  sendMessage(text) {
    // Add user message to chat
    this.messageDisplay.addUserMessage(text);
    
    // Show typing indicator
    this.typingIndicator.show();
    
    // Send message to server
    this.socketClient.sendChatMessage({
      message: text,
      targetLang: this.selectedLang,
      responseMode: this.selectedMode,
      interactionType: this.selectedInteraction,
      model: this.selectedModel
    });
    
    // Clear input
    this.input.value = '';
  }

  /**
   * Handle language change
   * @param {HTMLElement} button - The clicked language button
   */
  handleLanguageChange(button) {
    // Get the previously selected language
    const previousLang = this.selectedLang;
    
    // Remove active class from all buttons
    this.langButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    button.classList.add('active');
    
    // Set selected language
    this.selectedLang = button.getAttribute('data-lang');
    
    // Notify server about language change
    this.socketClient.notifySettingsChange({
      type: 'language',
      from: previousLang,
      to: this.selectedLang
    });
    
    // If in conversation mode and language changed, add a system message
    if (this.selectedInteraction === 'conversation' && previousLang !== this.selectedLang) {
      this.messageDisplay.addSystemMessage(`Language changed to ${this.selectedLang.toUpperCase()}. Responses will now be in ${this.getLangName(this.selectedLang)}.`);
    }
  }

  /**
   * Handle mode change (Standard/Poetic)
   * @param {HTMLElement} button - The clicked mode button
   */
  handleModeChange(button) {
    // Get the previously selected mode
    const previousMode = this.selectedMode;
    
    // Remove active class from all buttons
    this.modeButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    button.classList.add('active');
    
    // Set selected mode
    this.selectedMode = button.getAttribute('data-mode');
    
    // Notify server about mode change
    this.socketClient.notifySettingsChange({
      type: 'style',
      from: previousMode,
      to: this.selectedMode
    });
    
    // If in conversation mode and mode changed, add a system message
    if (this.selectedInteraction === 'conversation' && previousMode !== this.selectedMode) {
      this.messageDisplay.addSystemMessage(`Style changed to ${this.selectedMode.toUpperCase()}. Responses will now be in ${this.selectedMode} style.`);
    }
  }

  /**
   * Handle interaction type change (Translate/Converse)
   * @param {HTMLElement} button - The clicked interaction button
   */
  handleInteractionChange(button) {
    // Get the previously selected interaction type
    const previousInteraction = this.selectedInteraction;
    
    // Remove active class from all buttons
    this.interactionButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    button.classList.add('active');
    
    // Set selected interaction type
    this.selectedInteraction = button.getAttribute('data-interaction');
    
    // Notify server about interaction type change
    this.socketClient.notifySettingsChange({
      type: 'interaction',
      from: previousInteraction,
      to: this.selectedInteraction
    });
    
    // Update placeholder text based on interaction type
    if (this.selectedInteraction === 'translate') {
      this.input.placeholder = "Type your message to translate...";
      // If switching from conversation to translate, add system message
      if (previousInteraction === 'conversation') {
        this.messageDisplay.addSystemMessage("Switched to TRANSLATE mode. Your messages will be translated directly.");
      }
    } else {
      this.input.placeholder = "Type your message to chat...";
      // If switching from translate to conversation, add system message
      if (previousInteraction === 'translate') {
        this.messageDisplay.addSystemMessage("Switched to CONVERSE mode. The AI will respond to your messages conversationally.");
        // Let the server know we're switching to conversation mode
        this.socketClient.switchMode('conversation');
      }
    }
  }

  /**
   * Handle theme change callback
   * @param {string} newTheme - The new theme
   */
  handleThemeChange(newTheme) {
    this.messageDisplay.addSystemMessage(`Switched to ${newTheme.toUpperCase()} theme`);
  }
  
  /**
   * Handle model change
   * @param {Event} event - Change event from selector
   */
  handleModelChange(event) {
    const previousModel = this.selectedModel;
    this.selectedModel = event.target.value;
    
    // Notify server about model change
    this.socketClient.notifySettingsChange({
      type: 'model',
      from: previousModel,
      to: this.selectedModel
    });
    
    // Add system message about model change
    const modelName = this.selectedModel.toUpperCase();
    this.messageDisplay.addSystemMessage(`Switched to ${modelName} model`);
  }

  /**
   * Handle chat response from server
   * @param {object} response - Response from server
   */
  handleChatResponse(response) {
    // Remove the typing indicator
    this.typingIndicator.hide();
    
    // Add the response message
    this.messageDisplay.addBotMessage(response.text, {
      isPoetic: this.selectedMode === 'poetic',
      isConversation: this.selectedInteraction === 'conversation'
    });
    
    // Update the usage statistics
    this.usageStatsDisplay.update(response.stats, response.usage);
  }

  /**
   * Handle error from server
   * @param {object} error - Error object
   */
  handleError(error) {
    console.error('Error:', error);
    
    // Hide typing indicator
    this.typingIndicator.hide();
    
    // Show error message
    this.messageDisplay.addBotMessage('Sorry, an error occurred. Please try again.', { isError: true });
  }

  /**
   * Handle usage stats from server
   * @param {object} stats - Usage statistics
   */
  handleUsageStats(stats) {
    this.usageStatsDisplay.update(stats);
  }

  /**
   * Get language name from language code
   * @param {string} langCode - Language code
   * @returns {string} Language name
   */
  getLangName(langCode) {
    const langNames = {
      'en': 'English',
      'fr': 'French',
      'no': 'Norwegian',
      'es': 'Spanish',
      'sv': 'Swedish',
      'da': 'Danish',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'nl': 'Dutch',
      'ru': 'Russian',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'tr': 'Turkish',
      'pl': 'Polish'
    };
    return langNames[langCode] || langCode.toUpperCase();
  }

  /**
   * Scroll to bottom of chat container
   */
  scrollToBottom() {
    // Use setTimeout to ensure this runs after DOM updates are complete
    setTimeout(() => {
      this.messages.scrollTop = this.messages.scrollHeight;
      
      // Additional check to ensure we're at the bottom
      if (this.messages.scrollTop < this.messages.scrollHeight - this.messages.clientHeight) {
        this.messages.scrollTop = this.messages.scrollHeight;
      }
    }, 0);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
} else {
  window.App = App;
}