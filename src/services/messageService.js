const { getGreeting } = require('../utils/greeting');

function generateMessage(group) {
  const greeting = getGreeting();
  const contact = group[0].contact;
  const maxDelay = Math.max(...group.map(g => g.delayDays));
  const multipleCompanies = new Set(group.map(g => g.company)).size > 1;
  const multipleItems = group.length > 1;

  // Versão 5 — múltiplos títulos de empresas diferentes
  if (multipleCompanies) {
    const list = group.map(item =>
      `• ${item.company} – ${item.delayDays} dia(s) em atraso – ${item.value}`
    ).join('\n');

    return `${greeting}, ${contact}! Tudo bem?
Aqui é o Jonas, da Clic Biz 🙂
Estou acompanhando alguns títulos em aberto de empresas vinculadas ao seu contato:
${list}
Você poderia me informar se já há uma previsão de pagamento para esses títulos?
Caso precise, posso te enviar os boletos ou te auxiliar por aqui 🙂`;
  }

  // Versão 4 — múltiplos títulos da mesma empresa
  if (multipleItems) {
    const list = group.map(item =>
      `• ${item.company} – ${item.delayDays} dia(s) em atraso – ${item.value}`
    ).join('\n');

    return `${greeting}, ${contact}! Tudo bem?
Aqui é o Jonas, da Clic Biz 🙂 Estou acompanhando alguns títulos em aberto:
${list}
Consegue me informar se já há uma previsão de pagamento? Se precisar, posso te reenviar os boletos ou te auxiliar por aqui.`;
  }

  // Título único — escolhe template por dias de atraso
  const item = group[0];
  const info = `${item.delayDays} dia(s) em atraso – ${item.value}`;

  // Versão 6 — bloqueio (> 90 dias, título único)
  if (maxDelay > 90) {
    return `${greeting}, ${contact}! Tudo bem?
Aqui é o Jonas, da Clic Biz 🙂
Estou entrando em contato sobre um título de *${item.company}* com ${info}, que segue em aberto.
Precisamos da regularização desse valor com urgência. Caso o pagamento não seja identificado, o sistema poderá ser bloqueado temporariamente até a normalização.
Você consegue me informar uma previsão de pagamento ainda hoje?
Se precisar, posso te reenviar o boleto ou te auxiliar por aqui.`;
  }

  // Versão 3 — leve urgência (61 a 90 dias)
  if (maxDelay > 60) {
    return `${greeting}, ${contact}! Tudo bem?
Jonas aqui, da Clic Biz. Estou acompanhando um título de *${item.company}* com ${info}, e ele ainda consta em aberto por aqui.
Poderia me informar uma previsão de pagamento?`;
  }

  // Versão 2 — mais direta (16 a 60 dias)
  if (maxDelay > 15) {
    return `${greeting}, ${contact}! Tudo bem?
Jonas aqui, da Clic Biz. Notei que um título de *${item.company}* com ${info}, ainda está em aberto.
Você consegue me informar uma previsão de pagamento?`;
  }

  // Versão 1 — primeiro contato (1 a 15 dias)
  return `${greeting}, ${contact}! Tudo bem?
Aqui é o Jonas, da Clic Biz 🙂 Estou te entrando em contato referente a um título de *${item.company}* com ${info}.
Consegue me informar se já há uma previsão de pagamento? Fico à disposição pra te ajudar no que precisar.`;
}

module.exports = { generateMessage };