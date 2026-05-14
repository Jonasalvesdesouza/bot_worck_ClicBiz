const client = require('../client/whatsappClient');

function normalize(phone) {
  // remove tudo que não for número
  return phone.replace(/\D/g, '');
}

async function isValidNumber(phone) {
  // ✅ FIX Bug #2: client.destroy() desmonta o browser Puppeteer, mas o
  //    loop do processSend pode ter chamadas de getNumberId já enfileiradas.
  //    Verificar pupPage antes de usar evita o erro
  //    "Attempted to use detached Frame" e os falsos negativos de validação
  //    que apareciam no final do log após o destroy.
  if (!client.pupPage) {
    console.warn(`⚠️ Cliente já encerrado — validação cancelada para ${phone}`);
    return { valid: false, phone };
  }

  try {
    const clean = normalize(phone);

    const attempts = new Set();
    attempts.add(clean);

    if (!clean.startsWith('55')) {
      attempts.add('55' + clean);
    }

    for (const attempt of attempts) {
      console.log(`🔍 Testando: ${attempt}`);

      // ✅ Dupla checagem dentro do loop: o destroy pode ocorrer enquanto
      //    iteramos (ex.: timeout longo + Ctrl+C), então checamos de novo.
      if (!client.pupPage) {
        console.warn(`⚠️ Cliente encerrado durante validação de ${phone}`);
        return { valid: false, phone };
      }

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