/**
 * UI Controller Module
 * Handles UI interactions and timer functionality
 */

class UIController {
    constructor() {
        this.timerInterval = null;
        this.seconds = 0;
        this.difficulty = 'normal';
    }

    /**
     * Set difficulty level
     * @param {string} level - difficulty level
     */
    setDifficulty(level) {
        this.difficulty = level;
        this.shufflePuzzle();
    }

    /**
     * Generate and display a new puzzle
     */
    shufflePuzzle() {
        try {
            const newPuzzle = SudokuGenerator.generate(this.difficulty);
            window.currentPuzzle = newPuzzle;
            window.gridManager.createGrid(newPuzzle);
            this.startTimer(); // Reset and restart timer when new puzzle is created
        } catch (error) {
            console.error('Error generating puzzle:', error);
            alert('Failed to generate new puzzle. Please try again.');
        }
    }

    /**
     * Start the timer
     */
    startTimer() {
        // Clear existing timer if any
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Reset seconds
        this.seconds = 0;
        
        // Update display immediately
        document.getElementById('timer').textContent = '00:00';
        
        // Start new timer
        this.timerInterval = setInterval(() => {
            this.seconds++;
            const mins = Math.floor(this.seconds / 60);
            const secs = this.seconds % 60;
            document.getElementById('timer').textContent = 
                (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
        }, CONFIG.TIMER.UPDATE_INTERVAL);
    }

    /**
     * Stop the timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Get formatted time string
     * @returns {string} - formatted time
     */
    getFormattedTime() {
        const mins = Math.floor(this.seconds / 60);
        const secs = this.seconds % 60;
        return (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
    }

    /**
     * Set up midnight refresh for daily puzzle
     */
    setMidnightRefresh() {
        const now = new Date();
        const msToMidnight = new Date(
            now.getFullYear(), 
            now.getMonth(), 
            now.getDate() + 1, 
            0, 0, 0
        ) - now;
        
        setTimeout(() => {
            window.currentPuzzle = SudokuGenerator.getDailyPuzzle();
            window.gridManager.createGrid(window.currentPuzzle);
            this.setMidnightRefresh();
        }, msToMidnight);
    }

    /**
     * Initialize the application
     */
    init() {
        try {
            console.log('UIController.init() called');
            
            // Get daily puzzle
            window.currentPuzzle = SudokuGenerator.getDailyPuzzle();
            console.log('Daily puzzle loaded');
            
            // Create grid manager and expose to window
            window.gridManager = new GridManager();
            console.log('GridManager created:', !!window.gridManager);
            
            // Create initial grid
            window.gridManager.createGrid(window.currentPuzzle);
            console.log('Grid created');
            
            // Start timer
            this.startTimer();
            console.log('Timer started');
            
            // Set up midnight refresh
            this.setMidnightRefresh();
            console.log('Midnight refresh set');
            
            // Ensure functions are globally available (already defined in app.js)
            
            console.log('SudAIku initialized successfully');
        } catch (error) {
            console.error('Error initializing application:', error);
            alert('Failed to initialize the application. Please refresh the page.');
        }
    }

    /**
     * Handle window resize for responsive design
     */
    handleResize() {
        // Add any resize-specific logic here
        console.log('Window resized');
    }

    /**
     * Save user preferences
     * @param {Object} preferences - user preferences
     */
    savePreferences(preferences) {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
        } catch (error) {
            console.error('Failed to save preferences:', error);
        }
    }

    /**
     * Load user preferences
     * @returns {Object} - user preferences
     */
    loadPreferences() {
        try {
            const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_PREFERENCES);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Failed to load preferences:', error);
            return {};
        }
    }
}

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
} else {
    window.UIController = UIController;
}
