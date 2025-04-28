document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  const form = document.getElementById('chat-form');
  const input = document.getElementById('message-input');
  const messages = document.getElementById('messages');
  const langButtons = document.querySelectorAll('.lang-flag');
  const modeButtons = document.querySelectorAll('.mode-button');
  const interactionButtons = document.querySelectorAll('.interaction-button');
  
  let selectedLang = 'en'; // Default language
  let selectedMode = 'normal'; // Default mode
  let selectedInteraction = 'translate'; // Default interaction type
  
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
      // Add user message to chat
      addMessage(input.value, 'user');
      
      // Send message to server
      socket.emit('chat message', {
        message: input.value,
        targetLang: selectedLang,
        responseMode: selectedMode,
        interactionType: selectedInteraction
      });
      
      // Clear input
      input.value = '';
    }
  });
  
  // Receive response from server
  socket.on('chat response', (response) => {
    addMessage(response, 'bot');
    scrollToBottom();
  });
  
  // Handle errors
  socket.on('error', (error) => {
    console.error('Error:', error);
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
    messages.scrollTop = messages.scrollHeight;
  }
});