const { getGreeting } = require('../utils/greeting');

// ─────────────────────────────────────────────────────────────
// Helpers de pluralização — funções puras e reutilizáveis
// ─────────────────────────────────────────────────────────────

const pluralizeBoleto = (qty) =>
  qty === 1 ? 'boleto vencido' : 'boletos vencidos';

const pluralizeBoletoComArtigo = (qty) =>
  qty === 1 ? 'o boleto vencido' : 'os boletos vencidos';

// "do boleto vencido" | "dos boletos vencidos"  (de + artigo contraídos)
const pluralizeBoletoContraido = (qty) =>
  qty === 1 ? 'do boleto vencido' : 'dos boletos vencidos';

// "esse valor em aberto" | "esses valores em aberto"
const pluralizeValor = (qty) =>
  qty === 1 ? 'esse valor em aberto' : 'esses valores em aberto';

// ─────────────────────────────────────────────────────────────
// Builders de trechos reutilizáveis
// ─────────────────────────────────────────────────────────────

/**
 * Resumo de boletos de UMA empresa — usado na lista por empresa.
 *
 * Ex singular : "1 boleto vencido | R$ 566,31 | 15 dia(s) em atraso"
 * Ex plural   : "3 boletos vencidos | R$ 976,20 | 76 dia(s) em atraso"
 */
function buildEmpresaLine({ company, quantidadeBoletos: qty, value, delayDays }) {
  const boleto = pluralizeBoleto(qty);
  return `• *${company}*: ${qty} ${boleto} — ${value} — ${delayDays} dia(s) em atraso`;
}

/**
 * Bloco completo de listagem de empresas.
 * Usado quando o contato é responsável por mais de uma empresa.
 */
function buildEmpresaList(empresas) {
  return empresas.map(buildEmpresaLine).join('\n');
}

/**
 * Linha de abertura padrão (sem ponto final — cada template decide como continuar).
 */
function buildOpeningLine(greeting, contact) {
  return (
    `${greeting}, ${contact}. Espero que esta mensagem o encontre bem.\n\n` +
    `Meu nome é Jonas e represento a *Clic Biz*.`
  );
}

// ─────────────────────────────────────────────────────────────
// Seleção de nível de urgência por empresa
// ─────────────────────────────────────────────────────────────

/**
 * Retorna o nível de urgência com base nos dias de atraso.
 * Usado para ordenar empresas (mais crítica primeiro) e para
 * selecionar o tom geral da mensagem quando há múltiplas empresas.
 *
 * @returns {'critical' | 'urgency' | 'followUp' | 'firstContact'}
 */
function getUrgencyLevel(delayDays) {
  if (delayDays > 90) return 'critical';
  if (delayDays > 60) return 'urgency';
  if (delayDays > 15) return 'followUp';
  return 'firstContact';
}

const URGENCY_ORDER = { critical: 0, urgency: 1, followUp: 2, firstContact: 3 };

/**
 * Retorna o nível de urgência mais alto entre todas as empresas do grupo.
 * Define o tom geral da mensagem quando o contato tem múltiplas empresas.
 */
function getMaxUrgency(empresas) {
  return empresas.reduce((max, e) => {
    const level = getUrgencyLevel(e.delayDays);
    return URGENCY_ORDER[level] < URGENCY_ORDER[max] ? level : max;
  }, 'firstContact');
}

// ─────────────────────────────────────────────────────────────
// Templates — empresa única
//
// Recebem o contexto completo do grupo + a única empresa.
// ─────────────────────────────────────────────────────────────

const SINGLE_COMPANY_TEMPLATES = {

  firstContact({ greeting, contact, empresa }) {
    const { company, quantidadeBoletos: qty, value, delayDays } = empresa;
    const opening = buildOpeningLine(greeting, contact);
    return `${opening} Identificamos ${qty} ${pluralizeBoleto(qty)} em aberto no valor de ${value}, referente à empresa *${company}* — ${delayDays} dia(s) em atraso.

Por gentileza, poderia nos informar se já há uma previsão de pagamento para ${pluralizeValor(qty)}?

Fico inteiramente à disposição para reenviar ${pluralizeBoletoComArtigo(qty)} ou auxiliá-lo no que for necessário. Agradecemos a atenção e aguardamos seu retorno.`;
  },

  followUp({ greeting, contact, empresa }) {
    const { company, quantidadeBoletos: qty, value, delayDays } = empresa;
    const opening = buildOpeningLine(greeting, contact);
    return `${opening} Identificamos ${qty} ${pluralizeBoleto(qty)} em aberto no valor de ${value}, referente à empresa *${company}* — ${delayDays} dia(s) em atraso.

Poderia nos informar uma previsão de pagamento para ${pluralizeValor(qty)}?

Caso necessite ${pluralizeBoletoContraido(qty)} atualizado ou de qualquer outra informação, estamos à disposição para auxiliá-lo. Agradecemos a atenção.`;
  },

  urgency({ greeting, contact, empresa }) {
    const { company, quantidadeBoletos: qty, value, delayDays } = empresa;
    const opening = buildOpeningLine(greeting, contact);
    return `${opening} Identificamos ${qty} ${pluralizeBoleto(qty)} em aberto no valor de ${value}, referente à empresa *${company}* — ${delayDays} dia(s) em atraso — que ainda consta como pendente em nossos registros.

Poderia nos informar uma previsão de pagamento para ${pluralizeValor(qty)}?

Permanecemos à disposição para reenviar ${pluralizeBoletoComArtigo(qty)} ou esclarecer qualquer dúvida. Desde já, agradecemos a atenção.`;
  },

  critical({ greeting, contact, empresa }) {
    const { company, quantidadeBoletos: qty, value, delayDays } = empresa;
    const opening = buildOpeningLine(greeting, contact);
    return `${opening} Identificamos ${qty} ${pluralizeBoleto(qty)} em aberto no valor de ${value}, referente à empresa *${company}* — ${delayDays} dia(s) em atraso.

Informamos que, para evitar interrupções no sistema, é necessária a regularização de ${pluralizeValor(qty)} com brevidade. Caso o pagamento não seja identificado em nossos registros, o acesso poderá ser suspenso temporariamente.

Por gentileza, poderia nos informar uma previsão de pagamento ainda hoje?

Estamos inteiramente à disposição para reenviar ${pluralizeBoletoComArtigo(qty)} ou prestar qualquer esclarecimento necessário. Contamos com a sua compreensão e agradecemos a atenção.`;
  },
};

// ─────────────────────────────────────────────────────────────
// Templates — múltiplas empresas
//
// O contato é responsável por mais de uma empresa.
// As empresas são listadas em bloco, ordenadas da mais crítica.
// O tom geral segue a empresa de maior urgência.
// ─────────────────────────────────────────────────────────────

const MULTI_COMPANY_TEMPLATES = {

  firstContact({ greeting, contact, empresas, lista }) {
    const opening = buildOpeningLine(greeting, contact);
    return `${opening} Identificamos pendências em aberto vinculadas ao seu cadastro:

${lista}

Por gentileza, poderia nos informar se já há uma previsão de pagamento para esses valores?

Fico inteiramente à disposição para reenviar os boletos ou auxiliá-lo no que for necessário. Agradecemos a atenção e aguardamos seu retorno.`;
  },

  followUp({ greeting, contact, empresas, lista }) {
    const opening = buildOpeningLine(greeting, contact);
    return `${opening} Verificamos que os seguintes valores permanecem em aberto no seu cadastro:

${lista}

Poderia nos informar uma previsão de pagamento para esses valores?

Caso necessite dos boletos atualizados ou de qualquer outra informação, estamos à disposição para auxiliá-lo. Agradecemos a atenção.`;
  },

  urgency({ greeting, contact, empresas, lista }) {
    const opening = buildOpeningLine(greeting, contact);
    return `${opening} Constatamos que os seguintes títulos ainda constam como pendentes em nossos registros:

${lista}

Poderia nos informar uma previsão de pagamento para esses valores?

Permanecemos à disposição para reenviar os boletos ou esclarecer qualquer dúvida. Desde já, agradecemos a atenção.`;
  },

  critical({ greeting, contact, empresas, lista }) {
    const opening = buildOpeningLine(greeting, contact);
    return `${opening} Identificamos títulos em aberto vinculados ao seu cadastro, incluindo valores com atraso significativo:

${lista}

Para evitar interrupções no sistema, é necessária a regularização desses valores com brevidade. Caso os pagamentos não sejam identificados em nossos registros, o acesso poderá ser suspenso temporariamente.

Por gentileza, poderia nos informar uma previsão de pagamento ainda hoje?

Estamos inteiramente à disposição para reenviar os boletos ou prestar qualquer esclarecimento necessário. Contamos com a sua compreensão e agradecemos a atenção.`;
  },
};

// ─────────────────────────────────────────────────────────────
// API pública
// ─────────────────────────────────────────────────────────────

/**
 * Gera a mensagem de cobrança para um grupo (contato/telefone).
 *
 * Fluxo:
 *   1. Se o contato tem apenas 1 empresa → template de empresa única,
 *      tom definido pelos dias de atraso dessa empresa.
 *   2. Se o contato tem N empresas → template multi-empresa,
 *      ton definido pela empresa de maior urgência,
 *      empresas ordenadas da mais crítica para a menos crítica.
 *
 * @param {object} group - { phone, contact, empresas[] }
 * @returns {string} Mensagem pronta para envio
 */
function generateMessage(group) {
  const greeting = getGreeting();
  const { contact, empresas } = group;

  // Ordena empresas: mais crítica (maior atraso) primeiro
  const sorted = [...empresas].sort((a, b) => b.delayDays - a.delayDays);

  if (sorted.length === 1) {
    const empresa = sorted[0];
    const level   = getUrgencyLevel(empresa.delayDays);
    return SINGLE_COMPANY_TEMPLATES[level]({ greeting, contact, empresa });
  }

  // Múltiplas empresas
  const maxLevel = getMaxUrgency(sorted);
  const lista    = buildEmpresaList(sorted);
  return MULTI_COMPANY_TEMPLATES[maxLevel]({ greeting, contact, empresas: sorted, lista });
}

module.exports = {
  generateMessage,
  // Exportados para testes unitários
  pluralizeBoleto,
  pluralizeBoletoComArtigo,
  pluralizeValor,
  getUrgencyLevel,
  buildEmpresaLine,
};