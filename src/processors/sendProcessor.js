const { generateMessage } = require('../services/messageService');
const { sendMessage } = require('../services/sendService');
const { isValidNumber } = require('../services/validationService');
const { randomDelay } = require('../utils/delay');

function groupByPhone(customers) {
  const map = {};
  for (const c of customers) {
    const key = c.phone;
    if (!map[key]) map[key] = [];
    map[key].push(c);
  }
  return Object.values(map);
}

async function processSend(customers) {
  const groups = groupByPhone(customers);
  console.log(`📦 ${groups.length} grupo(s) de envio (por telefone)`);

  let enviados = 0;
  let falhos = 0;

  for (const group of groups) {
    const phone = group[0].phone;
    const contact = group[0].contact;

    try {
      const { valid, phone: validPhone } = await isValidNumber(phone);

      if (!valid) {
        console.log(`❌ Número inválido ou não está no WhatsApp: ${phone} (${contact})`);
        falhos++;
        continue;
      }

      console.log(`📤 Enviando para: ${validPhone} (${contact}) — ${group.length} título(s)`);

      const message = generateMessage(group);

      // ✅ ADICIONADO: exibe prévia da mensagem para facilitar debug
      console.log(`📝 Prévia:\n${message}\n${'─'.repeat(40)}`);

      await sendMessage(validPhone, message);
      enviados++;

      await randomDelay();
    } catch (err) {
      // ✅ CORRIGIDO: agora captura o erro relançado pelo sendMessage
      console.error(`⚠️ Falha no grupo de ${contact} (${phone}): ${err.message}`);
      falhos++;
      continue;
    }
  }

  // ✅ ADICIONADO: resumo final
  console.log(`\n✅ Envio finalizado! Enviados: ${enviados} | Falhos: ${falhos}`);
}

module.exports = { processSend };