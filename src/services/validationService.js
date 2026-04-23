const client = require('../client/whatsappClient');

function normalize(phone) {
  // remove tudo que não for número
  return phone.replace(/\D/g, '');
}

async function isValidNumber(phone) {
  try {
    const clean = normalize(phone);

    // Lista de tentativas
    const attempts = new Set();

    // Número original
    attempts.add(clean);

    // Se não tiver código do país, adiciona 55
    if (!clean.startsWith('55')) {
      attempts.add('55' + clean);
    }

    // Testa todas as possibilidades
    for (const attempt of attempts) {
      console.log(`🔍 Testando: ${attempt}`);
      const result = await client.getNumberId(attempt);
      if (result) {
        return { valid: true, phone: attempt };
      }
    }

    console.warn(`⚠️ Número não encontrado no WhatsApp: ${phone}`);
    return { valid: false, phone };

  } catch (err) {
    console.error(`❌ Erro ao validar número ${phone}:`, err.message);
    return { valid: false, phone };
  }
}

module.exports = { isValidNumber };