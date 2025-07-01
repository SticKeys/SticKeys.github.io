/**
 * Sudoku Solver Module
 * Handles solving sudoku puzzles and validation
 */

class SudokuSolver {
    /**
     * Solve a sudoku puzzle using backtracking
     * @param {number[][]} grid - 9x9 sudoku grid
     * @returns {boolean} - true if solved, false if unsolvable
     */
    static solve(grid) {
        const empty = this.findEmpty(grid);
        if (!empty) return true; // all cells filled

        const [row, col] = empty;
        for (let num = 1; num <= CONFIG.GENERATOR.GRID_SIZE; num++) {
            if (this.isValid(grid, row, col, num)) {
                grid[row][col] = num;
                // Try next cell
                if (this.solve(grid)) return true;
                // Undo and try next number
                grid[row][col] = 0;
            }
        }
        return false; // triggers backtrack
    }

    /**
     * Check if a number placement is valid
     * @param {number[][]} grid - 9x9 sudoku grid
     * @param {number} row - row index
     * @param {number} col - column index
     * @param {number} num - number to place
     * @returns {boolean} - true if valid placement
     */
    static isValid(grid, row, col, num) {
        // Check row
        for (let x = 0; x < CONFIG.GENERATOR.GRID_SIZE; x++) {
            if (grid[row][x] === num) return false;
        }
        
        // Check column
        for (let y = 0; y < CONFIG.GENERATOR.GRID_SIZE; y++) {
            if (grid[y][col] === num) return false;
        }
        
        // Check 3x3 box
        const boxRow = Math.floor(row / CONFIG.GENERATOR.BOX_SIZE) * CONFIG.GENERATOR.BOX_SIZE;
        const boxCol = Math.floor(col / CONFIG.GENERATOR.BOX_SIZE) * CONFIG.GENERATOR.BOX_SIZE;
        for (let i = 0; i < CONFIG.GENERATOR.BOX_SIZE; i++) {
            for (let j = 0; j < CONFIG.GENERATOR.BOX_SIZE; j++) {
                if (grid[boxRow + i][boxCol + j] === num) return false;
            }
        }
        
        return true;
    }

    /**
     * Find the first empty cell in the grid
     * @param {number[][]} grid - 9x9 sudoku grid
     * @returns {number[]|null} - [row, col] or null if no empty cells
     */
    static findEmpty(grid) {
        for (let i = 0; i < CONFIG.GENERATOR.GRID_SIZE; i++) {
            for (let j = 0; j < CONFIG.GENERATOR.GRID_SIZE; j++) {
                if (grid[i][j] === 0) return [i, j];
            }
        }
        return null;
    }

    /**
     * Check if a puzzle has a unique solution
     * @param {number[][]} grid - 9x9 sudoku grid
     * @returns {boolean} - true if unique solution exists
     */
    static hasUniqueSolution(grid) {
        const copy = grid.map(row => [...row]);
        const solutions = [];
        
        const findSolutions = (g) => {
            if (solutions.length > 1) return;
            
            const empty = this.findEmpty(g);
            if (!empty) {
                solutions.push(g.map(row => [...row]));
                return;
            }
            
            const [row, col] = empty;
            for (let num = 1; num <= CONFIG.GENERATOR.GRID_SIZE; num++) {
                if (this.isValid(g, row, col, num)) {
                    g[row][col] = num;
                    findSolutions(g);
                    g[row][col] = 0;
                }
            }
        };
        
        findSolutions(copy);
        return solutions.length === 1;
    }

    /**
     * Validate if all empty cells have at least one valid number
     * @param {number[][]} grid - 9x9 sudoku grid
     * @returns {boolean} - true if valid state
     */
    static hasValidCellsAfterMove(grid) {
        for (let i = 0; i < CONFIG.GENERATOR.GRID_SIZE; i++) {
            for (let j = 0; j < CONFIG.GENERATOR.GRID_SIZE; j++) {
                if (grid[i][j] === 0) {
                    let hasValid = false;
                    for (let num = 1; num <= CONFIG.GENERATOR.GRID_SIZE; num++) {
                        if (this.isValid(grid, i, j, num)) {
                            hasValid = true;
                            break;
                        }
                    }
                    if (!hasValid) return false;
                }
            }
        }
        return true;
    }

    /**
     * Validate if a sudoku grid structure is valid
     * @param {number[][]} grid - 9x9 sudoku grid
     * @returns {boolean} - true if valid structure
     */
    static isValidSudokuGrid(grid) {
        // Basic structure validation
        if (!Array.isArray(grid) || grid.length !== CONFIG.GENERATOR.GRID_SIZE) {
            console.log('Invalid grid structure');
            return false;
        }

        // Check for valid numbers and structure
        for (let i = 0; i < CONFIG.GENERATOR.GRID_SIZE; i++) {
            if (!Array.isArray(grid[i]) || grid[i].length !== CONFIG.GENERATOR.GRID_SIZE) {
                console.log('Invalid row structure at row', i);
                return false;
            }
            
            for (let j = 0; j < CONFIG.GENERATOR.GRID_SIZE; j++) {
                const num = grid[i][j];
                if (!Number.isInteger(num) || num < 0 || num > CONFIG.GENERATOR.GRID_SIZE) {
                    console.log('Invalid number at', i, j, ':', num);
                    return false;
                }
            }
        }

        // Check for conflicts and resolve them
        const conflicts = [];
        const tempGrid = grid.map(row => [...row]);
        
        for (let i = 0; i < CONFIG.GENERATOR.GRID_SIZE; i++) {
            for (let j = 0; j < CONFIG.GENERATOR.GRID_SIZE; j++) {
                const num = tempGrid[i][j];
                if (num !== 0) {
                    tempGrid[i][j] = 0;
                    if (!this.isValid(tempGrid, i, j, num)) {
                        console.log('Found conflict at', i, j, 'with number', num);
                        conflicts.push({row: i, col: j, num: num});
                    }
                    tempGrid[i][j] = num;
                }
            }
        }

        // Resolve conflicts by setting them to 0
        if (conflicts.length > 0) {
            console.log('Attempting to resolve', conflicts.length, 'conflicts');
            conflicts.forEach(conflict => {
                grid[conflict.row][conflict.col] = 0;
            });
        }

        return true;
    }
}

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SudokuSolver;
} else {
    window.SudokuSolver = SudokuSolver;
}
