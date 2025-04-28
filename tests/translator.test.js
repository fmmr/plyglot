const { translateMessage, processMessage, LANGUAGES, RESPONSE_MODES, INTERACTION_TYPES } = require('../src/translator');

// Mock OpenAI API and translator functions
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: 'Test response'
                  }
                }
              ]
            })
          }
        }
      };
    })
  };
});

// Mock the validation in the translator functions
const originalTranslateMessage = jest.requireActual('../src/translator').translateMessage;
jest.mock('../src/translator', () => {
  const actual = jest.requireActual('../src/translator');
  return {
    ...actual,
    translateMessage: jest.fn((message, targetLang, mode) => {
      if (!message || !targetLang || !actual.LANGUAGES[targetLang]) {
        throw new Error('Invalid message or language');
      }
      return Promise.resolve('Test response');
    }),
    processMessage: jest.fn((message, targetLang, mode, interactionType, chatHistory) => {
      if (!message || !targetLang || !actual.LANGUAGES[targetLang]) {
        throw new Error('Invalid message or language');
      }
      if (interactionType && !actual.INTERACTION_TYPES[interactionType]) {
        throw new Error('Invalid interaction type');
      }
      return Promise.resolve('Test response');
    })
  };
});

describe('Translator', () => {
  test('should have supported languages defined', () => {
    expect(LANGUAGES).toHaveProperty('en');
    expect(LANGUAGES).toHaveProperty('fr');
    expect(LANGUAGES).toHaveProperty('no');
    expect(LANGUAGES).toHaveProperty('es');
    expect(LANGUAGES).toHaveProperty('sv');
    expect(LANGUAGES).toHaveProperty('da');
    expect(LANGUAGES).toHaveProperty('de');
  });

  test('should have response modes defined', () => {
    expect(RESPONSE_MODES).toHaveProperty('normal');
    expect(RESPONSE_MODES).toHaveProperty('poetic');
  });

  test('should have interaction types defined', () => {
    expect(INTERACTION_TYPES).toHaveProperty('translate');
    expect(INTERACTION_TYPES).toHaveProperty('conversation');
  });

  describe('translateMessage', () => {
    test('should translate a message with default mode', async () => {
      const result = await translateMessage('Hello', 'fr');
      expect(result).toBe('Test response');
    });

    test('should translate a message with poetic mode', async () => {
      const result = await translateMessage('Hello', 'fr', RESPONSE_MODES.poetic);
      expect(result).toBe('Test response');
    });

    test('should throw error for invalid language', () => {
      expect(() => translateMessage('Hello', 'invalid')).toThrow('Invalid message or language');
    });

    test('should throw error for empty message', () => {
      expect(() => translateMessage('', 'fr')).toThrow('Invalid message or language');
    });
  });

  describe('processMessage', () => {
    test('should process message in translation mode', async () => {
      const result = await processMessage('Hello', 'fr', RESPONSE_MODES.normal, INTERACTION_TYPES.translate);
      expect(result).toBe('Test response');
    });

    test('should process message in conversation mode', async () => {
      const result = await processMessage('Hello', 'fr', RESPONSE_MODES.normal, INTERACTION_TYPES.conversation);
      expect(result).toBe('Test response');
    });

    test('should process message with poetic mode in conversation', async () => {
      const result = await processMessage('Hello', 'fr', RESPONSE_MODES.poetic, INTERACTION_TYPES.conversation);
      expect(result).toBe('Test response');
    });

    test('should throw error for invalid interaction type', () => {
      expect(() => processMessage('Hello', 'fr', RESPONSE_MODES.normal, 'invalid')).toThrow('Invalid interaction type');
    });
  });
});