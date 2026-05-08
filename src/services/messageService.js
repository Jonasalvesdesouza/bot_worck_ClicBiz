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
    return `${greeting}, ${contact}. Espero que esta mensagem o encontre bem.

Meu nome é Jonas e represento a *Clic Biz*. Estou entrando em contato para tratar de alguns títulos em aberto vinculados ao seu cadastro, referentes às seguintes empresas:

${list}

Por gentileza, poderia nos informar se já existe uma previsão de pagamento para esses valores?

Caso necessite, estou à disposição para reenviar os boletos ou prestar qualquer esclarecimento adicional. Desde já, agradecemos a atenção.`;
  }

  // Versão 4 — múltiplos títulos da mesma empresa
  if (multipleItems) {
    const list = group.map(item =>
      `• ${item.company} – ${item.delayDays} dia(s) em atraso – ${item.value}`
    ).join('\n');
    return `${greeting}, ${contact}. Espero que esta mensagem o encontre bem.

Sou Jonas, da empresa *Clic Biz*. Gostaria de tratar sobre alguns títulos em aberto registrados em seu nome:

${list}

Poderia nos informar se já há uma previsão de pagamento para esses valores?

Se preferir, posso reenviar os boletos correspondentes ou auxiliá-lo diretamente por aqui. Agradecemos a atenção e ficamos à disposição.`;
  }

  // Título único — escolhe template por dias de atraso
  const item = group[0];
  const info = `*${item.delayDays} dia(s) em atraso* – *${item.value}*`;

  // Versão 6 — bloqueio (> 90 dias, título único)
  if (maxDelay > 90) {
    return `${greeting}, ${contact}. Espero que esta mensagem o encontre bem.

Meu nome é Jonas e represento a *Clic Biz*. Estou entrando em contato para tratar de um título em aberto referente à empresa *${item.company}*, com ${info}.

Informamos que, para evitar interrupções no sistema, é necessária a regularização desse valor com brevidade. Caso o pagamento não seja identificado em nossos registros, o acesso poderá ser suspenso temporariamente até a normalização da situação.

Por gentileza, poderia nos informar uma previsão de pagamento ainda hoje?

Estamos inteiramente à disposição para reenviar o boleto ou prestar qualquer esclarecimento que seja necessário. Contamos com a sua compreensão e agradecemos a atenção.`;
  }

  // Versão 3 — leve urgência (61 a 90 dias)
  if (maxDelay > 60) {
    return `${greeting}, ${contact}. Espero que esta mensagem o encontre bem.

Sou Jonas, da empresa *Clic Biz*. Estou entrando em contato referente a um título em aberto da empresa *${item.company}*, com ${info}, que ainda consta como pendente em nossos registros.

Poderia nos informar uma previsão de pagamento para esse valor?

Permanecemos à disposição para reenviar o boleto ou esclarecer qualquer dúvida. Desde já, agradecemos a atenção.`;
  }

  // Versão 2 — mais direta (16 a 60 dias)
  if (maxDelay > 15) {
    return `${greeting}, ${contact}. Espero que esta mensagem o encontre bem.

Sou Jonas, da empresa *Clic Biz*. Verificamos que há um título em aberto referente à empresa *${item.company}*, com ${info}.

Poderia nos informar uma previsão de pagamento para esse valor?

Caso necessite do boleto atualizado ou de qualquer outra informação, estamos à disposição para auxiliá-lo. Agradecemos a atenção.`;
  }

  // Versão 1 — primeiro contato (1 a 15 dias)
  return `${greeting}, ${contact}. Espero que esta mensagem o encontre bem.

Meu nome é Jonas e represento a *Clic Biz*. Estou entrando em contato referente a um título em aberto da empresa *${item.company}*, com ${info}.

Por gentileza, poderia nos informar se já há uma previsão de pagamento para esse valor?

Fico inteiramente à disposição para reenviar o boleto ou auxiliá-lo no que for necessário. Agradecemos a atenção e aguardamos seu retorno.`;
}

module.exports = { generateMessage };