const { generateMessage } = require('../services/messageService');
const { sendMessage } = require('../services/sendService');
const { isValidNumber } = require('../services/validationService');
const { randomDelay } = require('../utils/delay');

// ─────────────────────────────────────────────────────────────
// Normalização defensiva do telefone
//
// Remove todos os não-dígitos e garante o prefixo 55.
// Serve como chave canônica de agrupamento, independente de como
// o número chegou do CSV (com ou sem espaços, traços, parênteses,
// código de país duplicado, etc.).
//
// Exemplos:
//   "(17) 99120-4960"  → "5517991204960"
//   "17 9 9120-4960"   → "5517991204960"
//   "5517991204960"    → "5517991204960"
//   "+55 17 99120-4960"→ "5517991204960"
// ─────────────────────────────────────────────────────────────
function normalizePhoneKey(phone) {
  // 1. Remove tudo que não for dígito
  const digits = String(phone).replace(/\D/g, '');

  // 2. Remove prefixo 55 duplicado antes de re-adicionar
  //    (evita "555517..." quando o número já veio com código de país)
  const local = digits.startsWith('55') ? digits.slice(2) : digits;

  // 3. Retorna sempre no formato canônico "55XXXXXXXXXXX"
  return `55${local}`;
}

// ─────────────────────────────────────────────────────────────
// Agrupamento em duas dimensões
//
// Dimensão 1 — telefone/contato : define QUEM recebe a mensagem
// Dimensão 2 — empresa          : cada empresa é listada separadamente
//                                 dentro da mesma mensagem
//
// Estrutura resultante por grupo:
// {
//   phone:   "5517991204960",   ← chave canônica
//   contact: "Rodrigo Marques Vieira",
//   empresas: [
//     { company, overdueCount, value, delayDays },
//     ...
//   ]
// }
// ─────────────────────────────────────────────────────────────

/**
 * Agrupa os clientes por telefone normalizado e, dentro de cada grupo,
 * consolida as empresas mantendo seus dados individuais.
 *
 * Regras:
 *  - A chave do mapa é sempre o telefone canônico (normalizePhoneKey).
 *  - O nome do contato é o da PRIMEIRA ocorrência do número
 *    (evita sobrescrever com variações ortográficas da mesma pessoa).
 *  - Empresas duplicadas (mesmo nome + mesmo valor + mesmo atraso)
 *    são ignoradas para prevenir duplo-envio em caso de CSV reprocessado.
 *
 * @param {Array<object>} customers - Lista bruta do JSON
 * @returns {Array<object>} - Lista de grupos prontos para envio
 */
function groupByPhone(customers) {
  const map = {};

  for (const c of customers) {
    const key = normalizePhoneKey(c.phone);

    if (!map[key]) {
      map[key] = {
        phone:    key,        // sempre no formato canônico
        contact:  c.contact,  // nome da primeira ocorrência
        empresas: [],
      };
    }

    // Deduplicação de empresa: ignora se já existe entrada com
    // mesmo nome de empresa + mesmo valor + mesmo número de dias de atraso
    const jaExiste = map[key].empresas.some(
      e =>
        e.company      === c.company &&
        e.value        === c.value   &&
        e.delayDays    === c.delayDays
    );

    if (!jaExiste) {
      map[key].empresas.push({
        company:      c.company,
        overdueCount: c.overdueCount,
        value:        c.value,
        delayDays:    c.delayDays,
      });
    } else {
      console.warn(
        `⚠️ Entrada duplicada ignorada: ${c.company} | ${c.value} | ${c.delayDays}d → ${key}`
      );
    }
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

  // Diagnóstico: lista grupos com mais de uma empresa
  const multiEmpresa = groups.filter(g => g.empresas.length > 1);
  if (multiEmpresa.length > 0) {
    console.log(`🔗 ${multiEmpresa.length} contato(s) com múltiplas empresas agrupadas:`);
    multiEmpresa.forEach(g =>
      console.log(`   → ${g.phone} (${g.contact}): ${g.empresas.map(e => e.company).join(', ')}`)
    );
  }

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

      const totalBoletos = empresas.reduce((sum, e) => sum + e.overdueCount, 0);
      console.log(
        `📤 Enviando para: ${validPhone} (${contact}) — ` +
        `${empresas.length} empresa(s) | ${totalBoletos} boleto(s)`
      );

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