function extractPhone(text) {
  if (!text) return null;

  let numbers = text.replace(/\D/g, '').slice(-11);
  if (numbers.length !== 11) return null;

  return `55${numbers}`;
}

function extractContact(text) {
  const match = text.match(/Contato:\s*(.*)/i);
  return match ? match[1].trim() : 'Customer';
}

module.exports = { extractPhone, extractContact };