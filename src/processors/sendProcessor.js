const { generateMessage } = require('../services/messageService');
const { sendMessage } = require('../services/sendService');
const { randomDelay } = require('../utils/delay');
const { normalizePhoneToDDI } = require('../utils/phone');

function groupByPhone(customers) {
  const map = new Map();

  for (const c of customers) {
    const key = normalizePhoneToDDI(c.phone);
    if (!key) continue;

    if (!map.has(key)) {
      map.set(key, { phone: key, contact: c.contact, empresas: [] });
    }
    const grupo = map.get(key);

    // Usa Set para evitar duplicidade de empresa
    const empresaKey = `${c.company}|${c.valorComJuros}|${c.delayDays}`;
    const jaExiste = grupo.empresas.some(e => 
      e.company === c.company && e.valorComJuros === c.valorComJuros
    );
    if (!jaExiste) {
      grupo.empresas.push({
        company: c.company,
        valorComJuros: c.valorComJuros,
        delayDays: c.delayDays,
        boletos: c.boletos,
      });
    }
  }
  return Array.from(map.values());
}

async function processSend(customers) {
  const groups = groupByPhone(customers);
  console.log(`📦 ${groups.length} contato(s) agrupados`);

  let enviados = 0, falhos = 0;
  for (const group of groups) {
    try {
      const message = generateMessage(group);
      console.log(`📤 Enviando para ${group.phone} (${group.contact})`);
      await sendMessage(group.phone, message);
      enviados++;
      await randomDelay();
    } catch (err) {
      console.error(`⚠️ Falha para ${group.contact}:`, err.message);
      falhos++;
    }
  }
  console.log(`✅ Finalizado. Enviados: ${enviados} | Falhos: ${falhos}`);
}

module.exports = { processSend };