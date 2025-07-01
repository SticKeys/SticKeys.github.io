/**
 * Image Processor Module
 * Handles image upload and processing with Google AI
 */

class ImageProcessor {
    /**
     * Upload and process sudoku image
     * @param {Event} event - file input change event
     */
    static async uploadImage(event) {
        const file = event.target.files[0];
        if (!file) {
            alert('Please select an image file.');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file (JPEG, PNG, etc.).');
            return;
        }

        // Check file size (limit to 20MB)
        const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
        if (file.size > MAX_FILE_SIZE) {
            alert(`Image is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please select an image under 20MB.`);
            return;
        }

        // Check if API key is configured
        if (!CONFIG.GOOGLE_AI_API_KEY || CONFIG.GOOGLE_AI_API_KEY === 'YOUR_API_KEY_HERE') {
            alert('Google AI API key not configured. Please set your API key in the config file.');
            return;
        }

        this.updateProgress(0, 'Starting upload...');

        try {
            const base64Image = await this.fileToBase64(file);
            this.updateProgress(30, 'Processing image...');
            
            try {
                const puzzle = await this.processWithAI(base64Image);
                
                if (puzzle) {
                    this.updateProgress(80, 'Validating puzzle...');
                    
                    if (SudokuSolver.isValidSudokuGrid(puzzle)) {
                        this.updateProgress(90, 'Creating puzzle...');
                        
                        // Store as current puzzle
                        window.currentPuzzle = puzzle.map(row => [...row]);
                        
                        // Create a fresh copy for solving
                        const solvableGrid = puzzle.map(row => [...row]);
                        
                        // Clear the previous solution
                        window.solution = null;
                        
                        // Get new solution
                        if (SudokuSolver.solve(solvableGrid)) {
                            // Store the new solution
                            window.solution = solvableGrid.map(row => [...row]);
                            console.log('New solution generated:', window.solution);
                            
                            // Create grid with the uploaded puzzle
                            window.gridManager.createGrid(window.currentPuzzle);
                            
                            if (window.gridManager.highlightMode) {
                                setTimeout(() => window.gridManager.checkSolution(), 100);
                            }
                            this.updateProgress(100, 'Complete!');
                        } else {
                            console.log('Puzzle state:', puzzle);
                            this.updateProgress(100, 'Invalid solution');
                            alert('The puzzle does not have a valid solution. Please try another image.');
                        }
                    } else {
                        this.updateProgress(100, 'Invalid format');
                        alert('Failed to create a valid puzzle from the image. Please try another image.');
                    }
                } else {
                    this.updateProgress(100, 'Parse error');
                    alert('Could not parse the numbers from the image. Please try a clearer image.');
                }
            } catch (aiError) {
                console.error('AI processing error:', aiError);
                
                // Parse error message and code
                const errorMessage = aiError.message || '';
                const errorCode = aiError.status || aiError.code || '';
                
                if (errorMessage.includes('API key') || errorCode === 401 || errorCode === 403) {
                    this.updateProgress(100, 'API key error');
                    alert('Invalid or missing API key. Please check your Google API key configuration.');
                } else if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorCode === 429) {
                    this.updateProgress(100, 'Quota exceeded');
                    alert('AI quota exceeded. Please try again later or check your Google API key quota limits.');
                } else if (errorMessage.includes('content filtered') || errorCode === 400) {
                    this.updateProgress(100, 'Content filtered');
                    alert('The image was filtered by safety settings. Please try a clearer image of a Sudoku puzzle.');
                } else if (errorMessage.includes('network') || errorCode === 'NETWORK_ERROR') {
                    this.updateProgress(100, 'Network error');
                    alert('Network error. Please check your internet connection and try again.');
                } else {
                    this.updateProgress(100, 'AI error');
                    alert(`AI processing error: ${errorMessage || 'Unknown error'}`);
                }
            }
        } catch (error) {
            console.error('Error processing image:', error);
            this.updateProgress(100, 'Error');
            alert('An error occurred while processing the image: ' + (error.message || 'Unknown error'));
        }
    }

    /**
     * Convert file to base64
     * @param {File} file - image file
     * @returns {Promise<string>} - base64 string
     */
    static fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Image = reader.result.split(',')[1];
                resolve(base64Image);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Process image with Google AI
     * @param {string} base64Image - base64 encoded image
     * @returns {Promise<number[][]|null>} - parsed sudoku grid or null
     */
    static async processWithAI(base64Image) {
        this.updateProgress(50, 'Sending to AI...');
        
        try {
            // First try using the GoogleGenAI client library if available
            if (typeof GoogleGenAI !== 'undefined') {
                return await this.processWithGenAIClient(base64Image);
            } else {
                // Fall back to direct REST API call
                return await this.processWithRestAPI(base64Image);
            }
        } catch (error) {
            console.error('Error processing with AI:', error);
            // Always try the REST API approach as fallback
            return await this.processWithRestAPI(base64Image);
        }
    }
    
    /**
     * Process image with Google GenAI client library
     * @param {string} base64Image - base64 encoded image
     * @returns {Promise<number[][]|null>} - parsed sudoku grid or null
     */
    static async processWithGenAIClient(base64Image) {
        this.updateProgress(55, 'Using GenAI client...');
        
        try {
            // Initialize the GenAI client with API key from config
            const genAI = new GoogleGenAI({
                apiKey: CONFIG.GOOGLE_AI_API_KEY
            });
            
            // Get the Gemini model
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash"
            });
            
            // Create the prompt - identical to the one used in REST API for consistency
            const prompt = "Look at this Sudoku puzzle and identify the numbers inside each cell. First crop and isolate the grid, look at the puzzle cell by cell row by row. If there is no number in a cell identify it as a 0. Populate a matrix with the numbers identified. Output format should be 9 lines of single-digit numbers separated by spaces, like this:\n0 1 2 3 4 5 6 7 8\n1 2 3 4 5 6 7 8 9\n...\nDo not include any other text or explanations. Only output the 81 numbers in a 9x9 grid.";
            
            // Create the content with text and image
            const contents = [
                { text: prompt },
                { inlineData: { 
                    data: base64Image,
                    mimeType: "image/jpeg"
                }}
            ];
            
            // Generate content
            const result = await model.generateContent({
                contents,
                generationConfig: {
                    temperature: 0,
                    topP: 0.1,
                    topK: 16
                }
            });
            
            const response = result.response;
            const matrixText = response.text();
            console.log('Raw Matrix Text from GenAI client:', matrixText);
            
            return this.parseMatrix(matrixText);
            
        } catch (error) {
            console.error('Error using GenAI client:', error);
            throw error;
        }
    }
    
    /**
     * Process image with REST API directly
     * @param {string} base64Image - base64 encoded image
     * @returns {Promise<number[][]|null>} - parsed sudoku grid or null
     */
    static async processWithRestAPI(base64Image) {
        this.updateProgress(55, 'Using REST API...');
        
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${CONFIG.GOOGLE_AI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { 
                                text: "Look at this Sudoku puzzle and identify the numbers inside each cell. First crop and isolate the grid, look at the puzzle cell by cell row by row. If there is no number in a cell identify it as a 0. Populate a matrix with the numbers identified. Output format should be 9 lines of single-digit numbers separated by spaces, like this:\n0 1 2 3 4 5 6 7 8\n1 2 3 4 5 6 7 8 9\n...\nDo not include any other text or explanations. Only output the 81 numbers in a 9x9 grid."
                            },
                            {
                                inlineData: {
                                    mimeType: "image/jpeg",
                                    data: base64Image
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0,
                        topP: 0.1,
                        topK: 16
                    }
                })
            }
        );

        const data = await response.json();
        this.updateProgress(70, 'Processing AI response...');
        
        console.log('Raw AI Response:', data);

        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            const matrixText = data.candidates[0].content.parts[0].text;
            console.log('Raw Matrix Text from REST API:', matrixText);

            const puzzle = this.parseMatrix(matrixText);
            console.log('Parsed Puzzle:', puzzle);
            
            return puzzle;
        }

        return null;
    }

    /**
     * Parse matrix text into 2D array
     * @param {string} text - text containing sudoku matrix
     * @returns {number[][]|null} - parsed matrix or null if invalid
     */
    static parseMatrix(text) {
        try {
            console.log('Original AI response text:', text);
            
            // Try to find a Sudoku-like pattern in the text
            // This regex looks for blocks of digits and spaces that resemble a Sudoku grid
            const sudokuRegex = /(\d[\s\d]{16,26}\d[\s\n]*){8,9}/;
            const match = text.match(sudokuRegex);
            
            if (match) {
                text = match[0];
                console.log('Found Sudoku pattern:', text);
            }
            
            // Clean up the text to handle various formats
            const cleanText = text
                .replace(/[^\d\s\n]/g, '') // Remove anything that's not a digit, space, or newline
                .replace(/\n+/g, '\n')     // Normalize multiple newlines
                .trim();                    // Remove leading/trailing whitespace
            
            console.log('Cleaned text:', cleanText);
            
            // Split into lines and filter out empty lines
            let lines = cleanText
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            
            console.log('Split lines:', lines);
            
            // If we don't have exactly 9 lines, try various parsing strategies
            if (lines.length !== CONFIG.GENERATOR.GRID_SIZE) {
                console.log('Lines count mismatch, trying alternative parsing...');
                
                // Strategy 1: Extract all digits and split into groups of 9
                const allNumbers = cleanText.match(/\d/g) || [];
                console.log('All numbers count:', allNumbers.length);
                
                if (allNumbers.length === 81) {
                    lines = [];
                    for (let i = 0; i < CONFIG.GENERATOR.GRID_SIZE; i++) {
                        const row = allNumbers.slice(i * CONFIG.GENERATOR.GRID_SIZE, (i + 1) * CONFIG.GENERATOR.GRID_SIZE).join(' ');
                        lines.push(row);
                    }
                    console.log('Reconstructed lines using all digits:', lines);
                }
                
                // Strategy 2: Join all lines and try to reformat based on number count
                if (lines.length !== CONFIG.GENERATOR.GRID_SIZE) {
                    const allText = lines.join(' ');
                    const digits = allText.match(/\d/g) || [];
                    
                    if (digits.length === 81) {
                        lines = [];
                        for (let i = 0; i < CONFIG.GENERATOR.GRID_SIZE; i++) {
                            const row = digits.slice(i * CONFIG.GENERATOR.GRID_SIZE, (i + 1) * CONFIG.GENERATOR.GRID_SIZE).join(' ');
                            lines.push(row);
                        }
                        console.log('Reconstructed lines using joined text:', lines);
                    }
                }
            }
            
            if (lines.length !== CONFIG.GENERATOR.GRID_SIZE) {
                console.error('Invalid number of lines:', lines.length);
                return null;
            }
            
            // Parse each line into an array of numbers
            const matrix = lines.map((line, rowIndex) => {
                let numbers = line.split(/\s+/)
                    .map(n => parseInt(n, 10))
                    .filter(n => !isNaN(n));
                
                // Handle lines with wrong number of digits
                if (numbers.length !== CONFIG.GENERATOR.GRID_SIZE) {
                    console.warn(`Row ${rowIndex + 1} has ${numbers.length} numbers instead of ${CONFIG.GENERATOR.GRID_SIZE}`);
                    
                    // If we have too many numbers, trim the excess
                    if (numbers.length > CONFIG.GENERATOR.GRID_SIZE) {
                        numbers = numbers.slice(0, CONFIG.GENERATOR.GRID_SIZE);
                    }
                    
                    // If we have too few numbers, pad with zeros
                    while (numbers.length < CONFIG.GENERATOR.GRID_SIZE) {
                        numbers.push(0);
                    }
                    
                    console.log(`Fixed row ${rowIndex + 1}:`, numbers);
                }
                
                return numbers;
            });
            
            // Final validation
            const isValid = matrix.length === CONFIG.GENERATOR.GRID_SIZE && 
                           matrix.every(row => row.length === CONFIG.GENERATOR.GRID_SIZE);
            
            if (!isValid) {
                console.error('Invalid matrix structure after parsing');
                return null;
            }
            
            console.log('Final parsed matrix:', matrix);
            return matrix;
            
        } catch (error) {
            console.error('Matrix parsing error:', error);
            return null;
        }
    }

    /**
     * Update progress bar
     * @param {number} percent - progress percentage
     * @param {string} message - progress message
     */
    static updateProgress(percent, message) {
        const progressContainer = document.getElementById('upload-progress');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        progressContainer.style.display = 'block';
        progressFill.style.width = `${percent}%`;
        progressText.textContent = message;
        
        if (percent === 100) {
            setTimeout(() => {
                progressContainer.style.display = 'none';
                progressFill.style.width = '0%';
            }, 1000);
        }
    }
}

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageProcessor;
} else {
    window.ImageProcessor = ImageProcessor;
}
