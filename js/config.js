/* Configuration */
const CONFIG = {
    // API Configuration - Set your Google AI API key here
    // You can either:
    // 1. Replace 'YOUR_API_KEY_HERE' with your actual key
    // 2. Use localStorage by calling setApiKey('your_key') in browser console
    // 3. Set it programmatically in your deployment
    GOOGLE_AI_API_KEY: 'YOUR_API_KEY_HERE',
    
    // Difficulty settings
    DIFFICULTY_SETTINGS: {
        easy: { minCells: 35, maxCells: 40 },
        normal: { minCells: 25, maxCells: 30 },
        hard: { minCells: 20, maxCells: 25 }
    },
    
    // Generator settings
    GENERATOR: {
        MAX_ATTEMPTS: 10,
        GRID_SIZE: 9,
        BOX_SIZE: 3
    },
    
    // Timer settings
    TIMER: {
        UPDATE_INTERVAL: 1000
    },
    
    // Local storage keys
    STORAGE_KEYS: {
        DAILY_PUZZLE: 'dailyPuzzle',
        USER_PREFERENCES: 'sudokuPreferences'
    }
};

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
