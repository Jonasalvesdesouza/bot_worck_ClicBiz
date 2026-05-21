const { Client, LocalAuth } = require('whatsapp-web.js');
const { SESSION } = require('../config/env');

/**
 * Retorna a instância singleton do cliente WhatsApp.
 * Cria uma nova se não existir.
 * Configuração: LocalAuth para persistir sessão, headless false (visível).
 */

let clientInstance = null;

function getClient() {
  if (!clientInstance) {
    clientInstance = new Client({
      authStrategy: new LocalAuth({ clientId: SESSION }),
      puppeteer: {
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        protocolTimeout: 180_000,
      },
    });
  }
  return clientInstance;
}

async function resetClient() {
  if (clientInstance) {
    try {
      await clientInstance.destroy();
    } catch (err) {
      console.warn('Erro ao destruir cliente antigo:', err.message);
    }
    clientInstance = null;
  }
}

module.exports = { getClient, resetClient };