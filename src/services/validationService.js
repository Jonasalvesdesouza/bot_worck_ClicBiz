const client = require('../client/whatsappClient');

async function isValidNumber(phone) {
  try {
    // Tenta o número como veio
    const result = await client.getNumberId(phone);
    if (result) return { valid: true, phone };

    // Se falhou e tem 13 dígitos (55 + DDD + 9 + 8dig), tenta sem o 9
    if (phone.length === 13) {
      const fallback = phone.slice(0, 4) + phone.slice(5); // remove o 9
      const result2 = await client.getNumberId(fallback);
      if (result2) return { valid: true, phone: fallback };
    }

    // Se tem 12 dígitos (55 + DDD + 8dig), tenta com o 9
    if (phone.length === 12) {
      const fallback = phone.slice(0, 4) + '9' + phone.slice(4); // insere o 9
      const result2 = await client.getNumberId(fallback);
      if (result2) return { valid: true, phone: fallback };
    }

    return { valid: false, phone };
  } catch {
    return { valid: false, phone };
  }
}

module.exports = { isValidNumber };