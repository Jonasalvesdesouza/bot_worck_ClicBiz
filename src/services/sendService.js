const client = require('../client/whatsappClient');
const { delay } = require('../utils/delay');

async function sendMessage(phone, message) {
  try {
    const wid = `${phone}@c.us`;
    await delay(1000);
    await client.sendMessage(wid, message);
    console.log(`✅ Mensagem enviada: ${phone}`);
  } catch (err) {
    console.warn(`⚠️ Falha ao enviar para ${phone}: ${err.message}`);
  }
}

module.exports = { sendMessage };