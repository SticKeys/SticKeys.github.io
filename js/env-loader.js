/**
 * Simple environment loader for browser environment
 * This is a fallback since we can't use process.env in the browser
 */

// Simple function to load config from localStorage or prompt user
function loadConfig() {
    let apiKey = localStorage.getItem('GOOGLE_AI_API_KEY');
    
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        // Check if it's still the default value
        if (CONFIG.GOOGLE_AI_API_KEY === 'YOUR_API_KEY_HERE') {
            console.warn('Google AI API key not configured. Image processing will not work.');
            console.warn('To set your API key, use any of these methods:');
            console.warn('1. Open browser console and run: setApiKey("your_api_key_here")');
            console.warn('2. Edit js/config.js to include your API key');
            console.warn('3. Create a .env file with your API key (see .env.example)');
            
            // Optionally prompt user for API key (commented out for production)
            // apiKey = prompt('Enter your Google AI API key (optional):');
            // if (apiKey) {
            //     localStorage.setItem('GOOGLE_AI_API_KEY', apiKey);
            //     CONFIG.GOOGLE_AI_API_KEY = apiKey;
            // }
        }
    } else {
        CONFIG.GOOGLE_AI_API_KEY = apiKey;
    }
}

// Load configuration when this script runs
loadConfig();

// Utility function to set API key programmatically
window.setApiKey = function(apiKey) {
    if (apiKey && apiKey.length > 10) {
        localStorage.setItem('GOOGLE_AI_API_KEY', apiKey);
        CONFIG.GOOGLE_AI_API_KEY = apiKey;
        console.log('API key set successfully');
        return true;
    } else {
        console.error('Invalid API key provided');
        return false;
    }
};

// Utility function to clear stored API key
window.clearApiKey = function() {
    localStorage.removeItem('GOOGLE_AI_API_KEY');
    CONFIG.GOOGLE_AI_API_KEY = 'YOUR_API_KEY_HERE';
    console.log('API key cleared');
};
