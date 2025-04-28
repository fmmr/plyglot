# Plyglot

A multilingual chat application for mobile terminals that translates messages into your preferred language, with support for multiple AI models and language options.

## About This Project

This app was created as an experiment to gain experience with frontend development using Claude as a pair-programming assistant. The author is primarily a backend software engineer with expertise in Kotlin and search software, making this a learning journey into web application development.

## Features

- Simple chat interface optimized for mobile devices
- Support for 18 languages including:
  - European: English, French, German, Italian, Spanish, Portuguese, Dutch, Polish, Russian
  - Nordic: Norwegian, Swedish, Danish
  - Asian: Chinese, Japanese, Korean, Hindi
  - Others: Arabic, Turkish
- Two interaction types:
  - Translation: Translates your input text to the selected language
  - Conversation: Responds as a chatbot in the selected language
- Two response styles: Standard and Poetic
- Configurable AI models:
  - Latest: GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
  - Specialized: GPT-4 Turbo (dated), GPT-3.5 Turbo 16k, GPT-4 Mini variants
  - Legacy and experimental models
- API usage tracking with token metrics and statistics
- Light and dark theme support with system preference detection
- Typing indicators to show when responses are being processed
- Clean and responsive UI with modular codebase architecture

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
   
4. (Optional) Configure default models:
   - In your `.env` file, you can specify default models:
   - `TRANSLATION_MODEL=gpt-4o` (for translation mode)
   - `CONVERSATION_MODEL=gpt-4o` (for conversation mode)
   - If not specified, the application will use "gpt-4" as the default

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
2. Select your preferred language by clicking on a flag icon (supports 18 languages)
3. Choose a response style:
   - Standard: Clear, accurate language
   - Poetic: Creative, expressive language with literary flair
4. Select an interaction type:
   - Translate: Simply translates your text to the selected language
   - Converse: Interacts as a chatbot, responding to your messages in context
5. Select an AI model from the dropdown menu:
   - For quicker responses: Choose GPT-3.5 Turbo or GPT-4o Mini
   - For highest quality: Choose GPT-4, GPT-4o, or GPT-4 Turbo
   - For specialized needs: Select from other available models
6. Type your message in any language
7. Toggle between light and dark themes using the theme selector
8. Watch for typing indicators while waiting for responses
9. Receive responses in your selected language and style
10. View API usage statistics by clicking the "API Usage" panel in the bottom right

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
- Translation and conversation powered by OpenAI API
- Modular architecture with:
  - Server-side modules: logger, chat history manager, socket manager
  - Client-side modules: app, theme manager, typing indicator, message display, usage stats display
- Comprehensive unit testing and end-to-end tests
- API usage tracking and statistics
- Responsive design for mobile devices
- Support for configurable models and language settings

## Configuration Options

The application supports several environment variables for customization:

- `PORT`: The port for the server (default: 3000)
- `OPENAIKEY`: Your OpenAI API key (required)
- `TRANSLATION_MODEL`: Default model for translation (default: gpt-4)
- `CONVERSATION_MODEL`: Default model for conversation (default: gpt-4)
- `DEBUG`: Enable detailed logging (default: true)

## License

MIT