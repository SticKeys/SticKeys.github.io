# SudAIku - Daily Sudoku Puzzle

A modern, responsive sudoku puzzle game with AI-powered image recognition capabilities.

## Features

- **Daily Sudoku Puzzles**: New puzzle every day with three difficulty levels
- **AI Image Recognition**: Upload photos of sudoku puzzles to digitize them automatically
- **Multiple Input Modes**: Normal mode for direct input, pencil mode for notes
- **Smart Highlighting**: Visual feedback for correct/incorrect entries
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Auto-solve**: Get solutions when you're stuck
- **Timer**: Track your solving time
- **Local Storage**: Save your progress and preferences

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SticKeys.github.io
   ```

2. **Configure Google Gemini API Key**
   - Get a Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Set your API key using one of these methods:
     - **Method 1**: Open your browser console on the page and run:
       ```javascript
       setApiKey('your_actual_api_key_here')
       ```
     - **Method 2**: Edit `js/config.js` and replace `YOUR_API_KEY_HERE` with your key
     - **Method 3**: Create a `.env` file based on `.env.example` with your API key:
       ```
       GOOGLE_AI_API_KEY=your_actual_api_key_here
       ```
   - The API key is stored securely in your browser's localStorage

3. **Serve the application**
   - For development: Use any local server (Live Server, Python's http.server, etc.)
   - For production: Deploy to any web hosting service

## File Structure

```
├── index.html              # Main HTML file
├── styles/
│   ├── main.css            # Main layout and typography
│   ├── sudoku.css          # Sudoku board specific styles
│   └── mobile.css          # Responsive design styles
├── js/
│   ├── config.js           # Configuration and settings
│   ├── sudoku-solver.js    # Sudoku solving algorithms
│   ├── sudoku-generator.js # Puzzle generation logic
│   ├── grid-manager.js     # Grid UI management
│   ├── image-processor.js  # AI image processing
│   ├── ui-controller.js    # UI interactions and timer
│   └── app.js              # Main application initialization
├── .env.example            # Environment variables template
└── README.md               # This file
```

## Usage

### Playing Sudoku
- Click on empty cells to enter numbers (1-9)
- Use the pencil mode (✎) to add notes/candidates
- Right-click to clear a cell
- Double-click to clear pencil marks
- Toggle highlighting to see correct/incorrect entries

### Image Recognition
1. Click "Take Photo" or "Choose from Gallery"
2. Select a clear image of a sudoku puzzle
3. Wait for AI processing (requires internet connection)
4. The digitized puzzle will appear on the board

### Controls
- **Pencil Mode**: Toggle between number entry and note-taking
- **Toggle Highlight**: Show correct/incorrect entries
- **Solve All**: Fill in the complete solution
- **New Puzzle**: Generate a fresh puzzle
- **Difficulty**: Choose Easy, Normal, or Hard

## Technical Details

### Dependencies
- **Canvas Confetti**: For celebration animations
- **Google AI (Gemini)**: For image recognition
- **No build process required**: Pure HTML/CSS/JavaScript

### Browser Support
- Modern browsers with ES6+ support
- Mobile browsers with file upload capability
- Requires internet connection for image processing only

### API Usage
The Google AI API is used only for image processing. The application works offline for all other features.

## Configuration

Edit `js/config.js` to customize:
- Difficulty settings (number of pre-filled cells)
- API endpoints
- Timer intervals
- Storage keys

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple devices/browsers
5. Submit a pull request

## License

This project is open source. Feel free to use and modify as needed.

## Credits

- Built with love for puzzle enthusiasts
- Uses Google AI for image recognition
- Confetti animation by Canvas Confetti library