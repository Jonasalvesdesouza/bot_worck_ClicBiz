const client = require('../client/whatsappClient');
const { delay } = require('../utils/delay');

const ackPromises = new Map();

client.on('message_ack', (ack) => {
  const pending = ackPromises.get(ack.id.id);
  if (pending) {
    if (ack.ack >= 2) {
      clearTimeout(pending.timeout);
      pending.resolve(true);
      ackPromises.delete(ack.id.id);
    }
  }
});

async function sendMessage(phone, message, retries = 2) {
  const wid = `${phone}@c.us`;
  for (let i = 0; i <= retries; i++) {
    try {
      await delay(1000);
      const result = await client.sendMessage(wid, message);
      const msgId = result.id.id;
      console.log(`📤 Mensagem enviada ao servidor (ID: ${msgId})`);

      // Aguarda ack
      const ackPromise = new Promise((resolve) => {
        const timeout = setTimeout(() => {
          if (ackPromises.has(msgId)) {
            ackPromises.delete(msgId);
            resolve(false);
          }
        }, 30000);
        ackPromises.set(msgId, { resolve, timeout });
      });

      const delivered = await ackPromise;
      if (delivered) {
        console.log(`✅ Mensagem entregue para ${phone}`);
      } else {
        console.warn(`⚠️ Mensagem enviada, mas confirmação de entrega não recebida para ${phone}`);
      }
      return;
    } catch (err) {
      if (i === retries) throw err;
      await delay(5000);
    }
  }
}

module.exports = { sendMessage };