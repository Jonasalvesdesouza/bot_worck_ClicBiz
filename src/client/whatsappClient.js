const { Client, LocalAuth } = require('whatsapp-web.js');
const { SESSION } = require('../config/env');

const client = new Client({
  authStrategy: new LocalAuth({ clientId: SESSION }),
  puppeteer: {
    headless: false,
    args: ['--no-sandbox'],
    protocolTimeout: 180_000, // 3 minutos
  }
});

module.exports = client;