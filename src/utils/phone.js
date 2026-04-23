function extractPhone(text) {
  if (!text) return null;

  const numbers = text.replace(/\D/g, '');

  // Pega os últimos 10 ou 11 dígitos (DDD + número)
  const local = numbers.slice(-11);

  // Já tem DDD + 9 dígitos
  if (local.length === 11) {
    return `55${local}`;
  }
// Já tem DDD + 8 dígitos
  if (local.length === 10) {
    return `55${local}`;
  }

  return null; // número inválido
}

function extractContact(text) {
  const match = text.match(/Contato:\s*(.*)/i);
  return match ? match[1].trim() : 'Cliente';
}

module.exports = { extractPhone, extractContact };