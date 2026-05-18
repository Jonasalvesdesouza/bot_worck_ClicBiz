/**
 * Extrai e normaliza o número de telefone de um campo de texto.
 *
 * Aceita formatos como:
 *   "(17) 99120-4960 Contato: João"   → "5517991204960"  (celular 9 dígitos)
 *   "(17) 3213-4960 Contato: Maria"   → "55173213 4960"  (fixo 8 dígitos)
 *   "5517991204960"                   → "5517991204960"  (já com DDI)
 *   "+55 17 9 9120-4960"              → "5517991204960"  (com DDI e espaço)
 *   "17991204960"                     → "5517991204960"  (sem DDI)
 *
 * Retorna sempre no formato "55DDDXXXXXXXX(X)" ou null se inválido.
 */
function extractPhone(text) {
  if (!text) return null;

  // 1. Separa o campo de telefone do campo de contato, se houver
  //    Ex: "17991204960 Contato: João" → usa só "17991204960"
  const phonePart = text.split(/contato:/i)[0];

  // 2. Remove tudo que não for dígito
  const digits = phonePart.replace(/\D/g, '');

  if (!digits) return null;

  // 3. Remove o DDI 55 do início, se presente, para trabalhar
  //    apenas com a parte local (DDD + número).
  //    Só remove se sobrar dígitos suficientes (evita remover
  //    o "55" de um número local que começa com esses algarismos).
  //    Exemplos:
  //      "5517991204960" (13d) → local = "17991204960" (11d) ✅
  //      "17991204960"   (11d) → local = "17991204960" (11d) ✅
  //      "551732134960"  (12d) → local = "1732134960"  (10d) ✅
  let local = digits;
  if (local.startsWith('55') && local.length > 11) {
    local = local.slice(2);
  }

  // 4. Valida o tamanho da parte local:
  //    - 11 dígitos = DDD (2) + celular com 9º dígito
  //    - 10 dígitos = DDD (2) + fixo ou celular sem 9º dígito
  //    -  9 dígitos = DDD (2) + número de 7 dígitos (raro, mas aceito)
  //    - Abaixo de 9 ou acima de 13 → inválido
  if (local.length >= 9 && local.length <= 13) {
    return `55${local}`;
  }

  return null; // número inválido ou incompleto
}

/**
 * Extrai o nome do contato de um campo que contém "Contato: Nome Sobrenome".
 * Retorna "Cliente" como fallback.
 */
function extractContact(text) {
  const match = text.match(/Contato:\s*(.*)/i);
  return match ? match[1].trim() : 'Cliente';
}

module.exports = { extractPhone, extractContact };