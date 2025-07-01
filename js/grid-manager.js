/**
 * Grid Manager Module
 * Handles the sudoku grid creation and interaction
 */

class GridManager {
    constructor() {
        this.currentMode = 'normal';
        this.highlightMode = false;
    }

    /**
     * Create the sudoku grid HTML
     * @param {number[][]} puzzle - 9x9 sudoku puzzle
     */
    createGrid(puzzle) {
        const grid = document.getElementById('sudoku-grid');
        grid.innerHTML = '';
        
        for (let i = 0; i < CONFIG.GENERATOR.GRID_SIZE; i++) {
            const row = document.createElement('tr');
            row.className = 'sudoku-row';
            
            for (let j = 0; j < CONFIG.GENERATOR.GRID_SIZE; j++) {
                const cell = document.createElement('td');
                cell.className = 'sudoku-cell';
                
                if (puzzle[i][j] !== 0) {
                    this.createGivenCell(cell, puzzle[i][j]);
                } else {
                    this.createInputCell(cell, i, j);
                }
                
                row.appendChild(cell);
            }
            
            grid.appendChild(row);
        }

        // Add user selection prevention style
        this.addUserSelectStyle();
    }

    /**
     * Create a cell with a given number
     * @param {HTMLElement} cell - cell element
     * @param {number} value - cell value
     */
    createGivenCell(cell, value) {
        const span = document.createElement('span');
        span.className = 'given';
        span.textContent = value;
        cell.appendChild(span);
    }

    /**
     * Create an input cell
     * @param {HTMLElement} cell - cell element
     * @param {number} row - row index
     * @param {number} col - column index
     */
    createInputCell(cell, row, col) {
        const input = document.createElement('input');
        input.type = 'number';
        input.inputMode = 'numeric';
        input.pattern = '[1-9]*';
        input.className = 'input-cell';
        input.maxLength = 1;
        input.dataset.row = row;
        input.dataset.col = col;
        
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder';
        
        this.addInputEventListeners(input, placeholder);
        
        cell.appendChild(input);
        cell.appendChild(placeholder);
    }

    /**
     * Add event listeners to input cells
     * @param {HTMLElement} input - input element
     * @param {HTMLElement} placeholder - placeholder element
     */
    addInputEventListeners(input, placeholder) {
        // Prevent invalid key presses
        input.addEventListener('keypress', (e) => {
            if (!/[1-9]/.test(e.key)) {
                e.preventDefault();
                return false;
            }
        });

        // Handle input changes
        input.addEventListener('input', (e) => {
            if (this.currentMode === 'normal') {
                placeholder.innerHTML = '';
                input.value = input.value.replace(/[^1-9]/g, '');
                this.maybeCheckPuzzle();
                
                if (this.highlightMode) {
                    setTimeout(() => this.checkSolution(), 0);
                }
            } else {
                const number = e.target.value;
                if (number) {
                    input.value = '';
                    const numbers = Array.from(placeholder.children)
                        .map(span => span.textContent)
                        .filter(n => n !== number);
                    numbers.push(number);
                    this.updatePlaceholder(placeholder, numbers);
                }
            }
        });

        // Right click to clear cell
        input.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            input.value = '';
            placeholder.innerHTML = '';
            if (this.highlightMode) {
                setTimeout(() => this.checkSolution(), 0);
            }
        });

        // Middle click to clear pencil marks
        input.addEventListener('auxclick', (e) => {
            if (e.button === 1) {
                e.preventDefault();
                placeholder.innerHTML = '';
            }
        });

        // Double click to clear pencil marks
        input.addEventListener('dblclick', (e) => {
            e.preventDefault();
            placeholder.innerHTML = '';
        });

        // Prevent middle click pasting
        input.addEventListener('mousedown', (e) => {
            if (e.button === 1) {
                e.preventDefault();
            }
        });
    }

    /**
     * Update placeholder with pencil marks
     * @param {HTMLElement} placeholder - placeholder element
     * @param {Array} numbers - array of numbers to display
     */
    updatePlaceholder(placeholder, numbers) {
        placeholder.innerHTML = '';
        numbers.sort().forEach(number => {
            const span = document.createElement('span');
            span.textContent = number;
            placeholder.appendChild(span);
        });
    }

    /**
     * Check if puzzle might be complete
     */
    maybeCheckPuzzle() {
        const inputs = document.querySelectorAll('.input-cell');
        for (const input of inputs) {
            if (input.value.trim() === '') return;
        }
        this.checkSolution();
    }

    /**
     * Check the current solution
     */
    checkSolution() {
        if (!window.solution) {
            console.error('No solution available');
            return;
        }

        let solved = true;
        const gridTable = document.getElementById('sudoku-grid');
        const rows = gridTable.getElementsByTagName('tr');
        
        // Get current puzzle state
        const currentState = Array(CONFIG.GENERATOR.GRID_SIZE).fill()
            .map(() => Array(CONFIG.GENERATOR.GRID_SIZE).fill(0));
        
        // First pass: collect all current values
        for (let i = 0; i < CONFIG.GENERATOR.GRID_SIZE; i++) {
            const cells = rows[i].getElementsByTagName('td');
            for (let j = 0; j < CONFIG.GENERATOR.GRID_SIZE; j++) {
                const input = cells[j].querySelector('.input-cell');
                const given = cells[j].querySelector('.given');
                if (input) {
                    currentState[i][j] = parseInt(input.value) || 0;
                } else if (given) {
                    currentState[i][j] = parseInt(given.textContent);
                }
            }
        }

        // Second pass: check and highlight
        for (let i = 0; i < CONFIG.GENERATOR.GRID_SIZE; i++) {
            const cells = rows[i].getElementsByTagName('td');
            for (let j = 0; j < CONFIG.GENERATOR.GRID_SIZE; j++) {
                const input = cells[j].querySelector('.input-cell');
                if (input) {
                    const value = currentState[i][j];
                    if (value !== 0) {
                        if (value === window.solution[i][j]) {
                            input.classList.add('highlight-correct');
                            input.classList.remove('highlight-incorrect');
                            if (this.currentMode === 'pencil') {
                                cells[j].querySelector('.placeholder').innerHTML = '';
                            }
                        } else {
                            input.classList.add('highlight-incorrect');
                            input.classList.remove('highlight-correct');
                            solved = false;
                        }
                    } else {
                        input.classList.remove('highlight-correct', 'highlight-incorrect');
                        solved = false;
                    }
                }
            }
        }
        
        if (solved) {
            setTimeout(() => {
                this.celebrateCompletion();
                alert('Congratulations! You have solved the puzzle correctly!');
            }, 100);
        }
    }

    /**
     * Clear all highlighting from the grid
     */
    clearHighlights() {
        const gridTable = document.getElementById('sudoku-grid');
        const rows = gridTable.getElementsByTagName('tr');
        
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            for (let j = 0; j < cells.length; j++) {
                const input = cells[j].querySelector('.input-cell');
                if (input) {
                    input.classList.remove('highlight-correct', 'highlight-incorrect');
                }
            }
        }
    }

    /**
     * Solve all empty cells
     */
    solveAll() {
        console.log('GridManager.solveAll() called');
        
        if (!window.solution) {
            console.error('No solution available');
            alert('No solution available');
            return;
        }
        console.log('Solution available, filling grid');

        const gridTable = document.getElementById('sudoku-grid');
        const rows = gridTable.getElementsByTagName('tr');

        for (let i = 0; i < CONFIG.GENERATOR.GRID_SIZE; i++) {
            const cells = rows[i].getElementsByTagName('td');
            for (let j = 0; j < CONFIG.GENERATOR.GRID_SIZE; j++) {
                const input = cells[j].querySelector('.input-cell');
                if (input) {
                    input.value = window.solution[i][j];
                    input.classList.add('solved');
                    input.disabled = true;
                    // Clear any pencil marks
                    const placeholder = cells[j].querySelector('.placeholder');
                    if (placeholder) {
                        placeholder.innerHTML = '';
                    }
                }
            }
        }

        if (this.highlightMode) {
            this.checkSolution();
        }
    }

    /**
     * Toggle between normal and pencil mode
     */
    toggleMode() {
        console.log('GridManager.toggleMode() called, current mode:', this.currentMode);
        this.currentMode = this.currentMode === 'normal' ? 'pencil' : 'normal';
        console.log('New mode:', this.currentMode);
        
        const modeBtn = document.getElementById('mode-toggle-btn');
        if (modeBtn) {
            if (this.currentMode === 'normal') {
                modeBtn.classList.remove('pencil-mode');
            } else {
                modeBtn.classList.add('pencil-mode');
            }
            console.log('Mode button updated');
        } else {
            console.error('Could not find mode-toggle-btn element');
        }
    }

    /**
     * Toggle highlight mode
     */
    toggleHighlight() {
        console.log('GridManager.toggleHighlight() called, current highlight mode:', this.highlightMode);
        this.highlightMode = !this.highlightMode;
        console.log('New highlight mode:', this.highlightMode);
        
        if (this.highlightMode) {
            this.checkSolution();
        } else {
            this.clearHighlights();
        }
        
        // Update button appearance
        document.querySelectorAll('.mode-toggle').forEach(button => {
            if (button.innerText.includes('Highlight')) {
                button.classList.toggle('active', this.highlightMode);
            }
        });
    }

    /**
     * Add style to prevent text selection
     */
    addUserSelectStyle() {
        if (!document.querySelector('#user-select-style')) {
            const style = document.createElement('style');
            style.id = 'user-select-style';
            style.textContent = `
                .input-cell {
                    user-select: none;
                    -webkit-user-select: none;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Celebration animation when puzzle is solved
     */
    celebrateCompletion() {
        // Create dancing cat
        const catContainer = document.createElement('div');
        catContainer.className = 'dancing-cats-container';
        catContainer.style.textAlign = 'center';

        const catGif = document.createElement('img');
        catGif.src = 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif';
        catGif.alt = 'Dancing Cat';
        catGif.style.width = '200px';

        catContainer.appendChild(catGif);
        document.body.appendChild(catContainer);

        // Confetti animation
        setTimeout(() => {
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                const particleCount = 50 * (timeLeft / duration);
                confetti(Object.assign({}, defaults, { 
                    particleCount, 
                    origin: { x: Math.random(), y: Math.random() - 0.2 }
                }));
            }, 250);
        }, 500);
    }
}

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GridManager;
} else {
    window.GridManager = GridManager;
    // Create an instance for global access if needed
    if (!window.gridManager) {
        console.log('Creating global GridManager instance');
    }
}
