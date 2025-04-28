// Import module paths
document.addEventListener('DOMContentLoaded', async () => {
  // Load modules
  await loadModules();
  
  // Initialize the app
  const app = new App();
});

/**
 * Load all modules
 */
async function loadModules() {
  const modulePaths = [
    'modules/theme-manager.js',
    'modules/typing-indicator.js',
    'modules/message-display.js',
    'modules/socket-client.js',
    'modules/usage-stats-display.js',
    'modules/app.js'
  ];
  
  // Load each module
  for (const path of modulePaths) {
    await loadScript(path);
  }
}

/**
 * Load a script dynamically
 * @param {string} path - Path to the script
 * @returns {Promise} Promise that resolves when the script is loaded
 */
function loadScript(path) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = path;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}