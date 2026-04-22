const client = require('../client/whatsappClient');

async function isValidNumber(phone) {
  try {
    const result = await client.getNumberId(phone);
    return !!result;
  } catch {
    return false;
  }
}

module.exports = { isValidNumber };