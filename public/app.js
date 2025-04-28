document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  const form = document.getElementById('chat-form');
  const input = document.getElementById('message-input');
  const messages = document.getElementById('messages');
  const langButtons = document.querySelectorAll('.lang-flag');
  const modeButtons = document.querySelectorAll('.mode-button');
  const interactionButtons = document.querySelectorAll('.interaction-button');
  const themeToggle = document.getElementById('theme-toggle');
  
  let selectedLang = 'en'; // Default language
  let selectedMode = 'normal'; // Default mode
  let selectedInteraction = 'translate'; // Default interaction type
  
  // Set initial theme based on user preference or system preference
  initTheme();
  
  // Set initial active language
  document.querySelector(`[data-lang="${selectedLang}"]`).classList.add('active');
  
  // Language selection
  langButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Get the previously selected language
      const previousLang = selectedLang;
      
      // Remove active class from all buttons
      langButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Set selected language
      selectedLang = button.getAttribute('data-lang');
      
      // If in conversation mode and language changed, add a system message
      if (selectedInteraction === 'conversation' && previousLang !== selectedLang) {
        addSystemMessage(`Language changed to ${selectedLang.toUpperCase()}. Responses will now be in ${getLangName(selectedLang)}.`);
      }
    });
  });
  
  // Mode selection (Standard/Poetic)
  modeButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Get the previously selected mode
      const previousMode = selectedMode;
      
      // Remove active class from all buttons
      modeButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Set selected mode
      selectedMode = button.getAttribute('data-mode');
      
      // If in conversation mode and mode changed, add a system message
      if (selectedInteraction === 'conversation' && previousMode !== selectedMode) {
        addSystemMessage(`Style changed to ${selectedMode.toUpperCase()}. Responses will now be in ${selectedMode} style.`);
      }
    });
  });
  
  // Interaction type selection (Translate/Converse)
  interactionButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Get the previously selected interaction type
      const previousInteraction = selectedInteraction;
      
      // Remove active class from all buttons
      interactionButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Set selected interaction type
      selectedInteraction = button.getAttribute('data-interaction');
      
      // Update placeholder text based on interaction type
      if (selectedInteraction === 'translate') {
        input.placeholder = "Type your message to translate...";
        // If switching from conversation to translate, add system message
        if (previousInteraction === 'conversation') {
          addSystemMessage("Switched to TRANSLATE mode. Your messages will be translated directly.");
        }
      } else {
        input.placeholder = "Type your message to chat...";
        // If switching from translate to conversation, add system message
        if (previousInteraction === 'translate') {
          addSystemMessage("Switched to CONVERSE mode. The AI will respond to your messages conversationally.");
          // Let the server know we're switching to conversation mode
          socket.emit('switch mode', { interactionType: 'conversation' });
        }
      }
    });
  });
  
  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (input.value.trim()) {
      sendMessage(input.value);
    }
  });
  
  // Function to send a message and handle the UI updates
  function sendMessage(text) {
    // Add user message to chat
    addMessage(text, 'user');
    
    // Show typing indicator
    showTypingIndicator();
    
    // Send message to server
    socket.emit('chat message', {
      message: text,
      targetLang: selectedLang,
      responseMode: selectedMode,
      interactionType: selectedInteraction
    });
    
    // Clear input
    input.value = '';
  }
  
  // Show the typing indicator
  function showTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.classList.add('typing-indicator');
    typingElement.id = 'typing-indicator';
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      typingElement.appendChild(dot);
    }
    
    messages.appendChild(typingElement);
    scrollToBottom();
  }
  
  // Hide the typing indicator
  function hideTypingIndicator() {
    const typingElement = document.getElementById('typing-indicator');
    if (typingElement) {
      typingElement.remove();
    }
  }
  
  // Receive response from server
  socket.on('chat response', (response) => {
    // Remove the typing indicator
    hideTypingIndicator();
    
    // Add the response message
    addMessage(response.text, 'bot');
    
    // Update the usage statistics
    updateUsageStats(response.stats, response.usage);
    
    scrollToBottom();
  });
  
  // Handle errors
  socket.on('error', (error) => {
    console.error('Error:', error);
    // Hide typing indicator
    hideTypingIndicator();
    // Show error message
    addMessage('Sorry, an error occurred. Please try again.', 'bot', true);
    scrollToBottom();
  });
  
  // Add message to chat
  function addMessage(text, sender, isError = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
    
    if (isError) {
      messageElement.classList.add('error');
    }
    
    // Add appropriate classes based on mode and interaction type
    if (sender === 'bot') {
      if (selectedMode === 'poetic') {
        messageElement.classList.add('poetic-message');
      }
      
      if (selectedInteraction === 'conversation') {
        messageElement.classList.add('conversation-message');
      }
    }
    
    messageElement.textContent = text;
    messages.appendChild(messageElement);
    scrollToBottom();
  }
  
  // Add system message (for mode changes, etc.)
  function addSystemMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'system-message');
    messageElement.textContent = text;
    messages.appendChild(messageElement);
    scrollToBottom();
  }
  
  // Get language name from language code
  function getLangName(langCode) {
    const langNames = {
      'en': 'English',
      'fr': 'French',
      'no': 'Norwegian',
      'es': 'Spanish',
      'sv': 'Swedish',
      'da': 'Danish',
      'de': 'German'
    };
    return langNames[langCode] || langCode.toUpperCase();
  }
  
  // Scroll to bottom of chat
  function scrollToBottom() {
    // Use setTimeout to ensure this runs after DOM updates are complete
    setTimeout(() => {
      messages.scrollTop = messages.scrollHeight;
      
      // Additional check to ensure we're at the bottom
      if (messages.scrollTop < messages.scrollHeight - messages.clientHeight) {
        messages.scrollTop = messages.scrollHeight;
      }
    }, 0);
  }
  
  // Theme management
  function initTheme() {
    // Check if user preference is stored
    const savedTheme = localStorage.getItem('plyglot-theme');
    
    if (savedTheme) {
      // Apply saved theme
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', defaultTheme);
      localStorage.setItem('plyglot-theme', defaultTheme);
    }
    
    // Set up theme toggle button
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Apply new theme
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save preference
    localStorage.setItem('plyglot-theme', newTheme);
    
    // Add system message
    addSystemMessage(`Switched to ${newTheme.toUpperCase()} theme`);
  }
  
  // Update usage statistics display
  function updateUsageStats(globalStats, lastRequestStats) {
    // Check if usage-stats container exists, if not create it
    let statsContainer = document.getElementById('usage-stats');
    
    if (!statsContainer) {
      // Create usage stats container
      statsContainer = document.createElement('div');
      statsContainer.id = 'usage-stats';
      statsContainer.classList.add('usage-stats');
      
      // Create toggle button
      const toggleButton = document.createElement('button');
      toggleButton.id = 'stats-toggle';
      toggleButton.classList.add('stats-toggle');
      toggleButton.textContent = 'API Usage';
      toggleButton.addEventListener('click', () => {
        statsContainer.classList.toggle('expanded');
      });
      
      // Create stats content container
      const statsContent = document.createElement('div');
      statsContent.id = 'stats-content';
      statsContent.classList.add('stats-content');
      
      // Add elements to DOM
      statsContainer.appendChild(toggleButton);
      statsContainer.appendChild(statsContent);
      document.querySelector('.app-container').appendChild(statsContainer);
    }
    
    // Update stats content
    const statsContent = document.getElementById('stats-content');
    
    // Format the statistics HTML
    let statsHTML = `
      <div class="stats-section">
        <h3>Session Totals</h3>
        <p>Total Requests: ${globalStats.totalRequests}</p>
        <p>Total Tokens: ${globalStats.totalTokens}</p>
        <p>Input Tokens: ${globalStats.promptTokens}</p>
        <p>Output Tokens: ${globalStats.completionTokens}</p>
        <p>Avg Tokens/Request: ${globalStats.avgTokensPerRequest}</p>
      </div>
      <div class="stats-section">
        <h3>By Type</h3>
        <p>Translations: ${globalStats.translationRequests}</p>
        <p>Conversations: ${globalStats.conversationRequests}</p>
      </div>
    `;
    
    // Add last request info if available
    if (lastRequestStats) {
      statsHTML += `
        <div class="stats-section">
          <h3>Last Request</h3>
          <p>Total: ${lastRequestStats.total_tokens} tokens</p>
          <p>Input: ${lastRequestStats.prompt_tokens} tokens</p>
          <p>Output: ${lastRequestStats.completion_tokens} tokens</p>
        </div>
      `;
    }
    
    statsContent.innerHTML = statsHTML;
  }

  // Request initial usage stats
  socket.emit('get usage stats');
  
  // Handle usage stats response
  socket.on('usage stats', (stats) => {
    updateUsageStats(stats, null);
  });
  
});