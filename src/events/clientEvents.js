const qrcode = require('qrcode-terminal');
const client = require('../client/whatsappClient');
const { loadCustomers } = require('../services/csvService');
const { processSend } = require('../processors/sendProcessor');

function startEvents() {
  client.on('qr', qr => {
    console.log('Scan QR Code:');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', async () => {
    console.log('Bot ready');

    const customers = await loadCustomers();
    await processSend(customers);

    client.destroy();
  });
}

module.exports = { startEvents };