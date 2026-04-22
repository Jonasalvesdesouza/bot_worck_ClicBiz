const client = require('../client/whatsappClient');
const { delay } = require('../utils/delay');

async function sendMessage(phone, message) {
  const wid = `${phone}@c.us`;

  await client.getChatById(wid);
  await delay(1000);

  await client.sendMessage(wid, message);
}

module.exports = { sendMessage };