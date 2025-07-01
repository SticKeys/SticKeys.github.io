/**
 * Sudoku Generator Module
 * Handles generating new sudoku puzzles
 */

class SudokuGenerator {
    /**
     * Generate a new sudoku puzzle
     * @param {string} difficulty - difficulty level (easy, normal, hard)
     * @returns {number[][]} - 9x9 sudoku puzzle
     */
    static generate(difficulty = 'normal') {
        let puzzle;
        let attempts = 0;
        const settings = CONFIG.DIFFICULTY_SETTINGS[difficulty];
        const { minCells, maxCells } = settings;

        do {
            try {
                // Generate empty 9x9 grid
                const grid = Array(CONFIG.GENERATOR.GRID_SIZE).fill()
                    .map(() => Array(CONFIG.GENERATOR.GRID_SIZE).fill(0));
                
                // Fill diagonal boxes first
                for (let i = 0; i < CONFIG.GENERATOR.GRID_SIZE; i += CONFIG.GENERATOR.BOX_SIZE) {
                    this.fillBox(grid, i, i);
                }
                
                // Solve the rest of the puzzle
                if (!SudokuSolver.solve(grid)) {
                    continue;
                }
                
                // Store the solution globally
                window.solution = grid.map(row => [...row]);
                
                // Create puzzle by removing numbers
                puzzle = grid.map(row => [...row]);
                const cellsToKeep = minCells + Math.floor(Math.random() * (maxCells - minCells + 1));
                const positions = Array.from({length: 81}, (_, i) => i);
                
                // Randomly remove numbers while ensuring unique solution
                while (positions.length > cellsToKeep) {
                    const index = Math.floor(Math.random() * positions.length);
                    const pos = positions[index];
                    const row = Math.floor(pos / CONFIG.GENERATOR.GRID_SIZE);
                    const col = pos % CONFIG.GENERATOR.GRID_SIZE;
                    const temp = puzzle[row][col];
                    
                    puzzle[row][col] = 0;
                    positions.splice(index, 1);

                    // Check if puzzle still has unique solution
                    if (!SudokuSolver.hasUniqueSolution(puzzle)) {
                        puzzle[row][col] = temp;
                    }
                }

                // Verify the puzzle is solvable
                const testGrid = puzzle.map(row => [...row]);
                if (SudokuSolver.solve(testGrid)) {
                    return puzzle;
                }

                attempts++;
            } catch (error) {
                console.error('Error generating puzzle:', error);
                attempts++;
            }
        } while (attempts < CONFIG.GENERATOR.MAX_ATTEMPTS);

        throw new Error('Failed to generate valid puzzle');
    }

    /**
     * Fill a 3x3 box with random numbers
     * @param {number[][]} grid - 9x9 sudoku grid
     * @param {number} row - starting row
     * @param {number} col - starting column
     */
    static fillBox(grid, row, col) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.shuffleArray(nums);
        
        for (let i = 0; i < CONFIG.GENERATOR.BOX_SIZE; i++) {
            for (let j = 0; j < CONFIG.GENERATOR.BOX_SIZE; j++) {
                grid[row + i][col + j] = nums[i * CONFIG.GENERATOR.BOX_SIZE + j];
            }
        }
    }

    /**
     * Fisher-Yates shuffle algorithm
     * @param {Array} array - array to shuffle
     * @returns {Array} - shuffled array
     */
    static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Get or generate daily puzzle
     * @returns {number[][]} - daily sudoku puzzle
     */
    static getDailyPuzzle() {
        const today = new Date().toDateString();
        const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.DAILY_PUZZLE);
        
        if (stored) {
            try {
                const {date, puzzle, savedSolution} = JSON.parse(stored);
                if (date === today) {
                    window.solution = savedSolution;
                    return puzzle;
                }
            } catch (error) {
                console.error('Error parsing stored puzzle:', error);
            }
        }
        
        const newPuzzle = this.generate();
        localStorage.setItem(CONFIG.STORAGE_KEYS.DAILY_PUZZLE, JSON.stringify({
            date: today,
            puzzle: newPuzzle,
            savedSolution: window.solution
        }));
        
        return newPuzzle;
    }
}

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SudokuGenerator;
} else {
    window.SudokuGenerator = SudokuGenerator;
}
