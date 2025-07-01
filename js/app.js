/**
 * Main Application Module
 * Initializes and coordinates all other modules
 */

// Global variables are managed in window scope for cross-file access
window.currentPuzzle = window.currentPuzzle || null;
window.solution = window.solution || null;

// Global function bindings for HTML onclick events
function toggleMode() {
    console.log('Toggle Mode clicked, gridManager available:', !!window.gridManager);
    if (window.gridManager) {
        window.gridManager.toggleMode();
    } else {
        console.error('Grid Manager not initialized');
    }
}

function toggleHighlight() {
    console.log('Toggle Highlight clicked, gridManager available:', !!window.gridManager);
    if (window.gridManager) {
        window.gridManager.toggleHighlight();
    } else {
        console.error('Grid Manager not initialized');
    }
}

function solveAll() {
    console.log('Solve All clicked, gridManager available:', !!window.gridManager);
    if (window.gridManager) {
        window.gridManager.solveAll();
    } else {
        console.error('Grid Manager not initialized');
    }
}

function shufflePuzzle() {
    if (window.uiController) {
        window.uiController.shufflePuzzle();
    } else {
        console.error('UI Controller not initialized');
    }
}

function setDifficulty(level) {
    if (window.uiController) {
        window.uiController.setDifficulty(level);
    } else {
        console.error('UI Controller not initialized');
    }
}

function uploadImage(event) {
    ImageProcessor.uploadImage(event);
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Initializing SudAIku application...');
        
        // Create UI controller and initialize
        window.uiController = new UIController();
        window.uiController.init();
        
        // Set up window resize handler
        window.addEventListener('resize', () => {
            if (window.uiController) {
                window.uiController.handleResize();
            }
        });
        
        // Set up error handling
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
        });
        
        // Verify initialization
        console.log('GridManager initialized:', !!window.gridManager);
        console.log('UIController initialized:', !!window.uiController);
        
        // Set up button handlers
        document.getElementById('mode-toggle-btn')?.addEventListener('click', toggleMode);
        document.getElementById('highlight-btn')?.addEventListener('click', toggleHighlight);
        document.getElementById('solve-btn')?.addEventListener('click', solveAll);
        document.getElementById('new-puzzle-btn')?.addEventListener('click', shufflePuzzle);
        document.getElementById('difficulty-select')?.addEventListener('change', (e) => setDifficulty(e.target.value));
        
        // Setup image upload buttons
        document.getElementById('take-photo-btn')?.addEventListener('click', () => {
            document.getElementById('sudoku-image-take').click();
        });
        document.getElementById('choose-photo-btn')?.addEventListener('click', () => {
            document.getElementById('sudoku-image-choose').click();
        });
        document.getElementById('sudoku-image-take')?.addEventListener('change', uploadImage);
        document.getElementById('sudoku-image-choose')?.addEventListener('change', uploadImage);
        
        console.log('Event handlers connected');
        console.log('SudAIku application initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        alert('Failed to load the application. Please refresh the page.');
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.uiController) {
        window.uiController.stopTimer();
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleMode,
        toggleHighlight,
        solveAll,
        shufflePuzzle,
        setDifficulty,
        uploadImage
    };
}
