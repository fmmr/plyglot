const { OpenAI } = require('openai');
require('dotenv').config();
const { trackUsage } = require('./usage-tracker');
const logger = require('./logger');

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAIKEY
});

// Default models - can be overridden via environment variables
const DEFAULT_MODELS = {
  translation: process.env.TRANSLATION_MODEL || 'gpt-4',
  conversation: process.env.CONVERSATION_MODEL || 'gpt-4'
};

const LANGUAGES = {
  en: 'English',
  fr: 'French',
  no: 'Norwegian',
  es: 'Spanish',
  sv: 'Swedish',
  da: 'Danish',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  nl: 'Dutch',
  ru: 'Russian',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
  hi: 'Hindi',
  tr: 'Turkish',
  pl: 'Polish'
};

const RESPONSE_MODES = {
  normal: 'normal',
  poetic: 'poetic'
};

const INTERACTION_TYPES = {
  translate: 'translate',
  conversation: 'conversation'
};

/**
 * Processes a message based on interaction type and response mode
 * @param {string} message - User's message
 * @param {string} targetLang - Target language code (en, fr, no)
 * @param {string} mode - Response mode (normal, poetic)
 * @param {string} interactionType - Interaction type (translate, conversation)
 * @param {Array} chatHistory - Previous messages in the conversation (for conversation mode)
 * @param {string} model - Override the default model (optional)
 * @returns {Promise<Object>} - Object containing response text and usage statistics
 */
async function processMessage(message, targetLang, mode = RESPONSE_MODES.normal, interactionType = INTERACTION_TYPES.translate, chatHistory = [], model = null) {
  if (!message || !targetLang || !LANGUAGES[targetLang]) {
    throw new Error('Invalid message or language');
  }

  let response;
  if (interactionType === INTERACTION_TYPES.translate) {
    response = await translateMessage(message, targetLang, mode, model);
  } else if (interactionType === INTERACTION_TYPES.conversation) {
    response = await conversationResponse(message, targetLang, mode, chatHistory, model);
  } else {
    throw new Error('Invalid interaction type');
  }

  return response;
}

/**
 * Translates a message to the target language using OpenAI
 * @param {string} message - Message to translate
 * @param {string} targetLang - Target language code (en, fr, no)
 * @param {string} mode - Response mode (normal, poetic)
 * @param {string} overrideModel - Override the default model (optional)
 * @returns {Promise<string>} - Translated message
 */
async function translateMessage(message, targetLang, mode = RESPONSE_MODES.normal, overrideModel = null) {
  try {
    let systemContent = `You are a professional translator specializing in ${LANGUAGES[targetLang]}.`;
    let additionalInstructions = '';
    
    if (mode === RESPONSE_MODES.poetic) {
      systemContent = `You are a poetic translator specializing in ${LANGUAGES[targetLang]}, with a flair for creative and expressive language.`;
      additionalInstructions = 'Make the translation poetic and expressive, using beautiful metaphors and elegant phrasing while maintaining the original meaning.';
    }

    const prompt = `Translate the following text to ${LANGUAGES[targetLang]}. 
    Maintain the original tone, meaning, and context as accurately as possible. 
    If there are any culturally specific references, adapt them appropriately for the target language.
    ${additionalInstructions}
    
    Text to translate: "${message}"
    
    Translation:`;

    // Get the model to use - client selection overrides default
    const model = overrideModel || DEFAULT_MODELS.translation;
    
    logger.api(`Using model ${model} for translation to ${targetLang}`);

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: systemContent
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: mode === RESPONSE_MODES.poetic ? 0.7 : 0.3,
      max_tokens: 500
    });

    // Track API usage
    if (response.usage) {
      trackUsage(response.usage, 'translation');
    }

    // Return both the translated text and token usage
    return {
      text: response.choices[0].message.content.trim(),
      usage: response.usage || null
    };
  } catch (error) {
    logger.error('OpenAI API error:', error);
    throw new Error('Translation service error');
  }
}

/**
 * Generates a conversation response in the target language
 * @param {string} message - User's message
 * @param {string} targetLang - Target language code (en, fr, no)
 * @param {string} mode - Response mode (normal, poetic)
 * @param {Array} chatHistory - Previous messages in the conversation
 * @param {string} overrideModel - Override the default model (optional)
 * @returns {Promise<string>} - Response message in target language
 */
async function conversationResponse(message, targetLang, mode = RESPONSE_MODES.normal, chatHistory = [], overrideModel = null) {
  try {
    let systemPrompt = `You are a helpful, friendly AI assistant who responds in ${LANGUAGES[targetLang]}. Always respond in ${LANGUAGES[targetLang]} regardless of the language the user writes in.`;
    
    if (mode === RESPONSE_MODES.poetic) {
      systemPrompt = `You are a poetic and expressive AI assistant who responds in ${LANGUAGES[targetLang]} with beautiful metaphors and elegant phrasing. Always respond in ${LANGUAGES[targetLang]} regardless of the language the user writes in.`;
    }
    
    // Format chat history for the API
    const messages = [
      {
        role: "system",
        content: systemPrompt
      }
    ];
    
    // Add chat history if available
    if (chatHistory && chatHistory.length > 0) {
      messages.push(...chatHistory);
    }
    
    // Add the current message
    messages.push({
      role: "user",
      content: message
    });
    
    // Get the model to use - client selection overrides default
    const model = overrideModel || DEFAULT_MODELS.conversation;
    
    logger.api(`Using model ${model} for conversation in ${targetLang}`);
    
    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: mode === RESPONSE_MODES.poetic ? 0.7 : 0.3,
      max_tokens: 500
    });

    // Track API usage
    if (response.usage) {
      trackUsage(response.usage, 'conversation');
    }

    // Return both the response text and token usage
    return {
      text: response.choices[0].message.content.trim(),
      usage: response.usage || null
    };
  } catch (error) {
    logger.error('OpenAI API error:', error);
    throw new Error('Conversation service error');
  }
}

module.exports = { 
  translateMessage, 
  processMessage,
  conversationResponse,
  LANGUAGES, 
  RESPONSE_MODES,
  INTERACTION_TYPES,
  DEFAULT_MODELS
};