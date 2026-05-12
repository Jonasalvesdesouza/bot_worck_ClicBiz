const { generateMessage } = require('../services/messageService');
const { sendMessage } = require('../services/sendService');
const { isValidNumber } = require('../services/validationService');
const { randomDelay } = require('../utils/delay');

// ─────────────────────────────────────────────────────────────
// Agrupamento em duas dimensões
//
// Dimensão 1 — telefone/contato : define QUEM recebe a mensagem
// Dimensão 2 — empresa          : cada empresa é listada separadamente
//                                 dentro da mesma mensagem
//
// Estrutura resultante por grupo:
// {
//   phone:   "5517991204960",
//   contact: "Rodrigo Marque Vieira",
//   empresas: [
//     { company, quantidadeBoletos, value, delayDays },
//     ...
//   ]
// }
// ─────────────────────────────────────────────────────────────

/**
 * Agrupa os clientes por telefone e, dentro de cada grupo,
 * consolida as empresas mantendo seus dados individuais.
 *
 * @param {Array<object>} customers - Lista bruta do JSON
 * @returns {Array<object>} - Lista de grupos prontos para envio
 */
function groupByPhone(customers) {
  const map = {};

  for (const c of customers) {
    const key = c.phone;

    if (!map[key]) {
      map[key] = {
        phone:    c.phone,
        contact:  c.contact,
        empresas: [],
      };
    }

    // Cada linha do CSV representa uma empresa com sua própria dívida
    map[key].empresas.push({
      company:           c.company,
      quantidadeBoletos: c.quantidadeBoletos,
      value:             c.value,
      delayDays:         c.delayDays,
    });
  }

  return Object.values(map);
}

/**
 * Processa o envio para todos os grupos.
 * Um grupo = um contato = uma mensagem = um número de telefone.
 *
 * @param {Array<object>} customers
 */
async function processSend(customers) {
  const groups = groupByPhone(customers);

  const totalEmpresas = customers.length;
  console.log(`📦 ${groups.length} contato(s) | ${totalEmpresas} empresa(s) no total`);

  let enviados = 0;
  let falhos   = 0;

  for (const group of groups) {
    const { phone, contact, empresas } = group;

    try {
      const { valid, phone: validPhone } = await isValidNumber(phone);

      if (!valid) {
        console.log(`❌ Número inválido ou fora do WhatsApp: ${phone} (${contact})`);
        falhos++;
        continue;
      }

      const totalBoletos = empresas.reduce((sum, e) => sum + e.quantidadeBoletos, 0);
      console.log(`📤 Enviando para: ${validPhone} (${contact}) — ${empresas.length} empresa(s) | ${totalBoletos} boleto(s)`);

      const message = generateMessage(group);

      console.log(`📝 Prévia:\n${message}\n${'─'.repeat(40)}`);

      await sendMessage(validPhone, message);
      enviados++;

      await randomDelay();
    } catch (err) {
      console.error(`⚠️ Falha para ${contact} (${phone}): ${err.message}`);
      falhos++;
    }
  }

  console.log(`\n✅ Envio finalizado! Enviados: ${enviados} | Falhos: ${falhos}`);
}

module.exports = { processSend };