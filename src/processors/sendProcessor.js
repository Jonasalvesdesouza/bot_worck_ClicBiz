const { generateMessage } = require('../services/messageService');
const { sendMessage } = require('../services/sendService');
const { isValidNumber } = require('../services/validationService');
const { randomDelay } = require('../utils/delay');

function groupByPhone(customers) {
  const map = {};
  for (const c of customers) {
    const key = c.phone; // ✅ agrupa pelo telefone
    if (!map[key]) map[key] = [];
    map[key].push(c);
  }
  return Object.values(map);
}

async function processSend(customers) {
  const groups = groupByPhone(customers);

  for (const group of groups) {
    try {
      const phone = group[0].phone;
      const contact = group[0].contact;
      const { valid, phone: validPhone } = await isValidNumber(phone);

      if (!valid) {
        console.log(`❌ Número inválido: ${phone} (${contact})`);
        continue;
      }

      console.log(`📤 Enviando para: ${validPhone} (${contact}) — ${group.length} titulo(s)`);
      const message = generateMessage(group);
      console.log(`📝 Mensagem:\n${message}\n`);
      await sendMessage(validPhone, message);
      await randomDelay();
    } catch (err) {
      console.warn(`⚠️ Erro no grupo ${group[0].contact}: ${err.message}`);
      continue;
    }
  }

  console.log('✅ Envio finalizado!');
}

module.exports = { processSend };