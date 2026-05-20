/**
 * Utilitários para normalização de telefone e contato.
 * Única fonte de verdade para limpeza/validação de números.
 */

/**
 * Normaliza um número de telefone para o padrão internacional 55XXXXXXXXXXX.
 * Remove tudo que não é dígito, trata códigos de país duplicados.
 * @param {string|number} phone
 * @returns {string|null} Telefone normalizado ou null se inválido
 */
function normalizePhoneToDDI(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;

  // Remove 55 inicial duplicado, se existir
  let local = digits.startsWith('55') ? digits.slice(2) : digits;

  // Validação de tamanho mínimo (10 dígitos para fixo, 11 para celular)
  if (local.length < 10 || local.length > 13) return null;

  return `55${local}`;
}

/**
 * Extrai e normaliza telefone de um campo misto (ex: "17991204960 Contato: João")
 * @param {string} text
 * @returns {string|null}
 */
function extractPhone(text) {
  if (!text) return null;
  const phonePart = text.split(/contato:/i)[0];
  return normalizePhoneToDDI(phonePart);
}

/**
 * Extrai nome do contato de um campo misto.
 * @param {string} text
 * @returns {string}
 */
function extractContact(text) {
  const match = text.match(/Contato:\s*(.*)/i);
  return match ? match[1].trim() : 'Cliente';
}

module.exports = { extractPhone, extractContact, normalizePhoneToDDI };