const qrcode = require('qrcode-terminal');
const client = require('../client/whatsappClient');
const { convertCsvToJson } = require('../services/csvService');
const { loadJson } = require('../services/jsonService');
const { processSend } = require('../processors/sendProcessor');

function startEvents() {
  client.on('qr', qr => {
    console.log('Scan QR Code:');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', async () => {
    console.log('Bot ready');
    await convertCsvToJson();         // 1️⃣ CSV -> JSON
    const customers = loadJson();     // 2️⃣ lê o JSON
    console.log(`📋 ${customers.length} clientes carregados`);
    await processSend(customers);     // 3️⃣ agrupa por phone e envia
    client.destroy();
  });
}

module.exports = { startEvents };