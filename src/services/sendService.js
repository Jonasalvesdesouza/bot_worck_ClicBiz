const { getClient } = require('../client/whatsappClient');
const { delay } = require('../utils/delay');
const { getShuttingDown } = require('./shutdownManager');

// REMOVIDO o listener global – será movido para attachEventHandlers

/**
 * Verifica se o cliente está pronto para enviar mensagens.
 */

const ackPromises = new Map();

// Obtém a instância atual do cliente
const client = getClient();

// Registra o listener de ACK assim que o módulo é carregado
client.on('message_ack', (ack) => {
  const pending = ackPromises.get(ack.id.id);
  if (pending && ack.ack >= 2) {
    clearTimeout(pending.timeout);
    pending.resolve(true);
    ackPromises.delete(ack.id.id);
  }
});

async function isClientReady() {
  const client = getClient();
  return client.info && client.info.wid && client.pupPage && !client.pupPage.isClosed();
}

/**
 * Envia mensagem com retry e aguarda confirmação de entrega (ACK).
 * O listener de ACK deve ser registrado externamente.
 * @param {string} phone - Número no formato 55XXXXXXXXXXX
 * @param {string} message - Texto da mensagem
 * @param {Object} ackPromises - Map compartilhado para promises de ACK (vem do evento)
 * @param {number} retries - Número de tentativas
 */

async function sendMessage(phone, message, retries = 3) {
  if (getShuttingDown()) {
    throw new Error('Sistema em shutdown, envio cancelado');
  }

  const wid = `${phone}@c.us`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (!(await isClientReady())) {
        throw new Error('Cliente não está pronto');
      }

      await delay(1000 * Math.pow(2, attempt));
      const client = getClient(); // sempre pegar a instância mais recente
      const sendPromise = client.sendMessage(wid, message);
      const result = await Promise.race([
        sendPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout no envio (60s)')), 60000))
      ]);

      const msgId = result.id.id;
      console.log(`📤 Mensagem enviada ao servidor (ID: ${msgId})`);

      const delivered = await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          if (ackPromises.has(msgId)) ackPromises.delete(msgId);
          resolve(false);
        }, 30000);
        ackPromises.set(msgId, { resolve, timeout });
      });

      if (delivered) {
        console.log(`✅ Mensagem entregue para ${phone}`);
        return;
      } else {
        console.warn(`⚠️ Mensagem enviada, mas confirmação não recebida para ${phone}`);
        return;
      }
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`Tentativa ${attempt+1} falhou para ${phone}: ${err.message}`);
      await delay(5000);
    }
  }
}

module.exports = { sendMessage };