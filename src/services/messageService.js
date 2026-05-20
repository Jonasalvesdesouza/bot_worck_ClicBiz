const { getGreeting } = require('../utils/greeting');

// ─────────────────────────────────────────────────────────────
// Helpers de pluralização
// ─────────────────────────────────────────────────────────────

const pluralizeBoleto = (qty) =>
  qty === 1 ? 'boleto vencido' : 'boletos vencidos';

const pluralizeBoletoComArtigo = (qty) =>
  qty === 1 ? 'o boleto vencido' : 'os boletos vencidos';

const pluralizeBoletoContraido = (qty) =>
  qty === 1 ? 'do boleto vencido' : 'dos boletos vencidos';

const pluralizeValor = (qty) =>
  qty === 1 ? 'esse valor em aberto' : 'esses valores em aberto';

const pluralizeValorTotal = (qty, value) =>
  qty === 1 ? `no valor de ${value}` : `totalizando ${value}`;

// ─────────────────────────────────────────────────────────────
// Formatação da lista de boletos (sempre exibe, mesmo com 1 boleto)
// ─────────────────────────────────────────────────────────────

function formatarListaBoletos(boletos) {
  if (!boletos || boletos.length === 0) return '';
  return boletos.map(b => {
    const titulo = b.titulo || 'Título não informado';
    const data = b.dtVenc || 'data não informada';
    const valor = b.vlTitulo || 'valor não informado';
    return `   ${titulo}  |   ${data}  |  ${valor}`;
  }).join('\n');
}

// ─────────────────────────────────────────────────────────────
// Builder de linha da empresa (usado em listas multi-empresa)
// ─────────────────────────────────────────────────────────────

function buildEmpresaLine(empresa) {
  const qty = empresa.boletos.length;
  const boletoWord = pluralizeBoleto(qty);
  const listaBoletos = formatarListaBoletos(empresa.boletos);
  const linhaPrincipal = `• *${empresa.company}*: ${qty} ${boletoWord} — ${empresa.valorComJuros} — ${empresa.delayDays} dia(s) em atraso`;
  // Agora SEMPRE exibe a lista se existir (não depende do qty > 1)
  if (listaBoletos) {
    return `${linhaPrincipal}\n📆 *Boletos:*\n${listaBoletos}`;
  }
  return linhaPrincipal;
}

function buildEmpresaList(empresas) {
  return empresas.map(buildEmpresaLine).join('\n\n');
}

// ─────────────────────────────────────────────────────────────
// Abertura padrão
// ─────────────────────────────────────────────────────────────

function buildOpeningLine(greeting, contact) {
  return `${greeting}, ${contact}. Espero que esta mensagem o encontre bem.\n\nMeu nome é Jonas e represento a *Clic Biz*.`;
}

// ─────────────────────────────────────────────────────────────
// Níveis de urgência
// ─────────────────────────────────────────────────────────────

function getUrgencyLevel(delayDays) {
  if (delayDays > 90) return 'critical';
  if (delayDays > 60) return 'urgency';
  if (delayDays > 15) return 'followUp';
  return 'firstContact';
}

const URGENCY_ORDER = { critical: 0, urgency: 1, followUp: 2, firstContact: 3 };

function getMaxUrgency(empresas) {
  return empresas.reduce((max, e) => {
    const level = getUrgencyLevel(e.delayDays);
    return URGENCY_ORDER[level] < URGENCY_ORDER[max] ? level : max;
  }, 'firstContact');
}

// ─────────────────────────────────────────────────────────────
// Templates para empresa única
// ─────────────────────────────────────────────────────────────

const SINGLE_COMPANY_TEMPLATES = {
  firstContact({ greeting, contact, empresa }) {
    const { company, boletos, valorComJuros, delayDays } = empresa;
    const qty = boletos.length;
    const opening = buildOpeningLine(greeting, contact);
    const listaBoletos = formatarListaBoletos(boletos);
    const boletoText = pluralizeBoleto(qty);
    const valorTotalText = pluralizeValorTotal(qty, valorComJuros);
    const valorText = pluralizeValor(qty);
    const artigoText = pluralizeBoletoComArtigo(qty);

    let corpo = `${opening} Identificamos ${qty} ${boletoText} em aberto ${valorTotalText}, referente à empresa *${company}* — ${delayDays} dia(s) em atraso.\n\n`;

    // SEMPRE exibe a lista de boletos (se existir)
    if (listaBoletos) {
      corpo += `📆 *Boletos:*\n${listaBoletos}\n\n`;
    }

    corpo += `Por gentileza, poderia nos informar previsão de pagamento para ${valorText}?\n\n`;
    corpo += `Fico inteiramente à disposição para reenviar ${artigoText} ou auxiliá-lo no que for necessário. Agradecemos a atenção e aguardamos seu retorno.`;
    return corpo;
  },

  followUp({ greeting, contact, empresa }) {
    const { company, boletos, valorComJuros, delayDays } = empresa;
    const qty = boletos.length;
    const opening = buildOpeningLine(greeting, contact);
    const listaBoletos = formatarListaBoletos(boletos);
    const boletoText = pluralizeBoleto(qty);
    const valorTotalText = pluralizeValorTotal(qty, valorComJuros);
    const valorText = pluralizeValor(qty);
    const contraidoText = pluralizeBoletoContraido(qty);

    let corpo = `${opening} Identificamos ${qty} ${boletoText} em aberto ${valorTotalText}, referente à empresa *${company}* — ${delayDays} dia(s) em atraso.\n\n`;

    if (listaBoletos) {
      corpo += `📆 *Boletos:*\n${listaBoletos}\n\n`;
    }

    corpo += `Poderia nos informar previsão de pagamento para ${valorText}?\n\n`;
    corpo += `Caso necessite ${contraidoText} atualizado ou de qualquer outra informação, estamos à disposição para auxiliá-lo. Agradecemos a atenção.`;
    return corpo;
  },

  urgency({ greeting, contact, empresa }) {
    const { company, boletos, valorComJuros, delayDays } = empresa;
    const qty = boletos.length;
    const opening = buildOpeningLine(greeting, contact);
    const listaBoletos = formatarListaBoletos(boletos);
    const boletoText = pluralizeBoleto(qty);
    const valorTotalText = pluralizeValorTotal(qty, valorComJuros);
    const valorText = pluralizeValor(qty);
    const artigoText = pluralizeBoletoComArtigo(qty);

    let corpo = `${opening} Identificamos ${qty} ${boletoText} em aberto ${valorTotalText}, referente à empresa *${company}* — ${delayDays} dia(s) em atraso — que ainda consta como pendente em nossos registros.\n\n`;

    if (listaBoletos) {
      corpo += `📆 *Boletos:*\n${listaBoletos}\n\n`;
    }

    corpo += `Poderia nos informar previsão de pagamento para ${valorText}?\n\n`;
    corpo += `Permanecemos à disposição para reenviar ${artigoText} ou esclarecer qualquer dúvida. Desde já, agradecemos a atenção.`;
    return corpo;
  },

  critical({ greeting, contact, empresa }) {
    const { company, boletos, valorComJuros, delayDays } = empresa;
    const qty = boletos.length;
    const opening = buildOpeningLine(greeting, contact);
    const listaBoletos = formatarListaBoletos(boletos);
    const boletoText = pluralizeBoleto(qty);
    const valorTotalText = pluralizeValorTotal(qty, valorComJuros);
    const valorText = pluralizeValor(qty);
    const artigoText = pluralizeBoletoComArtigo(qty);

    let corpo = `${opening} Identificamos ${qty} ${boletoText} em aberto ${valorTotalText}, referente à empresa *${company}* — ${delayDays} dia(s) em atraso.\n\n`;

    if (listaBoletos) {
      corpo += `📆 *Boletos:*\n${listaBoletos}\n\n`;
    }

    corpo += `Informamos que, para evitar interrupções no sistema, é necessária a regularização de ${valorText} com brevidade. Caso o pagamento não seja identificado em nossos registros, o acesso poderá ser suspenso temporariamente.\n\n`;
    corpo += `Por gentileza, poderia nos informar previsão de pagamento ainda hoje?\n\n`;
    corpo += `Estamos inteiramente à disposição para reenviar ${artigoText} ou prestar qualquer esclarecimento necessário. Contamos com a sua compreensão e agradecemos a atenção.`;
    return corpo;
  },
};

// ─────────────────────────────────────────────────────────────
// Templates para múltiplas empresas
// ─────────────────────────────────────────────────────────────

const MULTI_COMPANY_TEMPLATES = {
  firstContact({ greeting, contact, empresas, lista }) {
    const opening = buildOpeningLine(greeting, contact);
    return `${opening} Identificamos pendências em aberto vinculadas ao seu cadastro:\n\n${lista}\n\nPoderia nos informar previsão de pagamento?\n\nFico inteiramente à disposição para reenviar os boletos ou auxiliá-lo no que for necessário. Agradecemos a atenção e aguardamos seu retorno.`;
  },

  followUp({ greeting, contact, empresas, lista }) {
    const opening = buildOpeningLine(greeting, contact);
    return `${opening} Verificamos que os seguintes valores permanecem em aberto no seu cadastro:\n\n${lista}\n\nPoderia nos informar previsão de pagamento para esses valores?\n\nCaso necessite dos boletos atualizados ou de qualquer outra informação, estamos à disposição para auxiliá-lo. Agradecemos a atenção.`;
  },

  urgency({ greeting, contact, empresas, lista }) {
    const opening = buildOpeningLine(greeting, contact);
    return `${opening} Constatamos que os seguintes títulos ainda constam como pendentes em nossos registros:\n\n${lista}\n\nPoderia nos informar previsão de pagamento para esses valores?\n\nPermanecemos à disposição para reenviar os boletos ou esclarecer qualquer dúvida. Desde já, agradecemos a atenção.`;
  },

  critical({ greeting, contact, empresas, lista }) {
    const opening = buildOpeningLine(greeting, contact);
    return `${opening} Identificamos títulos em aberto vinculados ao seu cadastro, incluindo valores com atraso significativo:\n\n${lista}\n\nPara evitar interrupções no sistema, é necessária a regularização desses valores com brevidade. Caso os pagamentos não sejam identificados em nossos registros, o acesso poderá ser suspenso temporariamente.\n\nPor gentileza, poderia nos informar previsão de pagamento ainda hoje?\n\nEstamos inteiramente à disposição para reenviar os boletos ou prestar qualquer esclarecimento necessário. Contamos com a sua compreensão e agradecemos a atenção.`;
  },
};

// ─────────────────────────────────────────────────────────────
// Função principal
// ─────────────────────────────────────────────────────────────

function generateMessage(group) {
  const greeting = getGreeting();
  const { contact, empresas } = group;

  const sorted = [...empresas].sort((a, b) => b.delayDays - a.delayDays);

  if (sorted.length === 1) {
    const empresa = sorted[0];
    const level = getUrgencyLevel(empresa.delayDays);
    return SINGLE_COMPANY_TEMPLATES[level]({ greeting, contact, empresa });
  }

  const maxLevel = getMaxUrgency(sorted);
  const lista = buildEmpresaList(sorted);
  return MULTI_COMPANY_TEMPLATES[maxLevel]({ greeting, contact, empresas: sorted, lista });
}

module.exports = {
  generateMessage,
  pluralizeBoleto,
  pluralizeBoletoComArtigo,
  pluralizeValor,
  pluralizeValorTotal,
  getUrgencyLevel,
  buildEmpresaLine,
};