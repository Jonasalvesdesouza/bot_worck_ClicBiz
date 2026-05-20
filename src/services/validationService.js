const client = require('../client/whatsappClient');
const { normalizePhoneToDDI } = require('../utils/phone');
const { delay } = require('../utils/delay');

let isShuttingDown = false;

function setShuttingDown(state) {
  isShuttingDown = state;
}

async function isValidNumber(phone) {
  if (isShuttingDown) {
    console.warn(`⏸️ Validação abortada (shutdown): ${phone}`);
    return { valid: false, phone };
  }

  const clean = normalizePhoneToDDI(phone);
  if (!clean) return { valid: false, phone };

  try {
    const result = await client.getNumberId(clean);
    if (result) return { valid: true, phone: clean };
    console.warn(`❌ Número não registrado no WhatsApp: ${clean}`);
    return { valid: false, phone: clean };
  } catch (err) {
    console.error(`Erro na validação de ${clean}:`, err.message);
    return { valid: false, phone: clean };
  }
}

async function validateBatch(phones, concurrency = 1) {
  const { default: pLimit } = await import('p-limit');
  const limit = pLimit(concurrency);
  const results = await Promise.all(
    phones.map(phone => limit(() => isValidNumber(phone)))
  );
  return results;
}

async function waitForClientReady(timeout = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (client.info && client.info.wid) {
      console.log('✅ Cliente pronto!');
      return true;
    }
    console.log('⏳ Aguardando cliente ficar pronto...');
    await delay(2000);
    // Tenta uma validação dummy com um número fixo de teste (opcional)
    try {
      // Usa um número conhecido seu ou apenas verifica se client.pupPage existe
      if (client.pupPage && !client.pupPage.isClosed()) {
        console.log('✅ Cliente aparentemente pronto (página aberta)');
        return true;
      }
    } catch (err) {
      // ignora e continua aguardando
    }
  }
  throw new Error('Timeout aguardando cliente WhatsApp ficar pronto');
}

module.exports = { isValidNumber, validateBatch, setShuttingDown, waitForClientReady };