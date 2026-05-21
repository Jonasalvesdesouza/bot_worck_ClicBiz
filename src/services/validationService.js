const { getClient } = require('../client/whatsappClient');
const { getShuttingDown } = require('./shutdownManager');
const { normalizePhoneToDDI } = require('../utils/phone');
const { VALIDATION_CONCURRENCY } = require('../config/env');

async function isValidNumber(phone) {
  if (getShuttingDown()) {
    console.warn(`⏸️ Validação abortada (shutdown): ${phone}`);
    return { valid: false, phone };
  }

  const clean = normalizePhoneToDDI(phone);
  if (!clean) return { valid: false, phone };

  try {
    const client = getClient();
    const result = await client.getNumberId(clean);
    if (result) return { valid: true, phone: clean };
    console.warn(`❌ Número não registrado no WhatsApp: ${clean}`);
    return { valid: false, phone: clean };
  } catch (err) {
    console.error(`Erro na validação de ${clean}:`, err.message);
    return { valid: false, phone: clean };
  }
}

async function validateBatch(phones, concurrency = VALIDATION_CONCURRENCY) {
  const { default: pLimit } = await import('p-limit');
  const limit = pLimit(concurrency);
  const results = await Promise.all(
    phones.map(phone => limit(() => isValidNumber(phone)))
  );
  return results;
}

module.exports = { isValidNumber, validateBatch };