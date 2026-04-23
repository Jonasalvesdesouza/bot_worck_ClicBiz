function extractPhone(text) {
  if (!text) return null;

  const numbers = text.replace(/\D/g, '');

  // Pega os últimos 10 ou 11 dígitos (DDD + número)
  const local = numbers.slice(-11);

  if (local.length === 11) {
    // Já tem DDD + 9 dígitos
    return `55${local}`;
  }

  if (local.length === 10) {
    // DDD + 8 dígitos — celular antigo, insere o 9 após o DDD
    const ddd = local.slice(0, 2);
    const num = local.slice(2);
    return `55${ddd}9${num}`;
  }

  return null; // número inválido
}

function extractContact(text) {
  const match = text.match(/Contato:\s*(.*)/i);
  return match ? match[1].trim() : 'Cliente';
}

module.exports = { extractPhone, extractContact };