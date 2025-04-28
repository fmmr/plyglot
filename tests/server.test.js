const request = require('supertest');
const { app } = require('../src/server');
const { processMessage, RESPONSE_MODES, INTERACTION_TYPES } = require('../src/translator');

// Mock the translator module
jest.mock('../src/translator');

describe('Server', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should serve static files', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.header['content-type']).toContain('text/html');
  });

  test('should serve CSS files', async () => {
    const response = await request(app).get('/styles.css');
    expect(response.status).toBe(200);
    expect(response.header['content-type']).toContain('text/css');
  });

  test('should serve JavaScript files', async () => {
    const response = await request(app).get('/app.js');
    expect(response.status).toBe(200);
    expect(response.header['content-type']).toContain('application/javascript');
  });

  // Note: Socket.io testing would typically be more complex and require a socket.io client
  // These are just simple examples
  test('processMessage function should be defined', () => {
    expect(typeof processMessage).toBe('function');
  });
  
  test('response modes should be defined', () => {
    expect(RESPONSE_MODES).toHaveProperty('normal');
    expect(RESPONSE_MODES).toHaveProperty('poetic');
  });
  
  test('interaction types should be defined', () => {
    expect(INTERACTION_TYPES).toHaveProperty('translate');
    expect(INTERACTION_TYPES).toHaveProperty('conversation');
  });
});