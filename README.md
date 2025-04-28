# Plyglot

A multilingual chat application for mobile terminals that translates messages into your preferred language.

## About This Project

This app was created as an experiment to gain experience with frontend development using Claude as a pair-programming assistant. The author is primarily a backend software engineer with expertise in Kotlin and search software, making this a learning journey into web application development.

## Features

- Simple chat interface optimized for mobile devices
- Support for multiple languages: English, French, Norwegian, Spanish, Swedish, Danish, and German
- Two interaction types:
  - Translation: Translates your input text to the selected language
  - Conversation: Responds as a chatbot in the selected language
- Two response styles: Standard and Poetic
- Real-time communication using OpenAI's GPT models
- Light and dark theme support with system preference detection
- Typing indicators to show when responses are being processed
- Clean and responsive UI

## Requirements

- Node.js (v14 or later)
- NPM (v6 or later)
- OpenAI API key

## Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/plyglot.git
cd plyglot
```

2. Install dependencies:
```
npm install
```

3. Set up your OpenAI API key:
   - Create a `.env` file in the root directory
   - Add your OpenAI API key: `OPENAIKEY=your_api_key_here`

## Running the App

Start the development server:
```
npm run dev
```

Or for production:
```
npm start
```

The app will be available at `http://localhost:3000`

## How to Use

1. Open the app in your browser (optimized for mobile)
2. Select your preferred language by clicking on a flag (English, French, Norwegian, Spanish, Swedish, Danish, or German)
3. Choose a response style:
   - Standard: Clear, accurate language
   - Poetic: Creative, expressive language with literary flair
4. Select an interaction type:
   - Translate: Simply translates your text to the selected language
   - Converse: Interacts as a chatbot, responding to your messages in context
5. Type your message in any language
6. Toggle between light and dark themes using the theme selector
7. Watch for typing indicators while waiting for responses
8. Receive responses in your selected language and style

## Testing

Run the test suite once:
```
npm test
```

Run tests in continuous watch mode (automatically re-runs when any file changes):
```
npm run test:watch
```

This watch mode is ideal for development as it provides immediate feedback as you make changes.

## Technical Details

- Built with Node.js and Express
- Real-time communication with Socket.IO
- Translation powered by OpenAI API
- Responsive design for mobile devices

## License

MIT