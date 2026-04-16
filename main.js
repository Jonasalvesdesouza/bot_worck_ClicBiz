const cron = require('node-cron');
const { verificarDividasVencendo, salvarDB, lerDB } = require('./src/cobrancaService');

// Executa todo dia às 9h
cron.schedule('0 9 * * *', async () => {
  const notificacoes = verificarDividasVencendo();
  
  for (const item of notificacoes) {
    const mensagem = `Olá ${item.nome}, lembrete amigável: sua conta "${item.divida.descricao}" no valor de R$ ${item.divida.valor} vence em breve (${item.divida.vencimento}). Evite juros!`;
    
    // Envia a mensagem usando o cliente do WhatsApp (depende da lib usada)
    await sock.sendMessage(item.id, { text: mensagem });
    
    // Atualiza contador de lembretes
    const db = lerDB();
    const cliente = db.clientes.find(c => c.id === item.id);
    const divida = cliente.dividas.find(d => d.descricao === item.divida.descricao);
    divida.lembretes_enviados = (divida.lembretes_enviados || 0) + 1;
    salvarDB(db);
  }
  
  console.log(`[${new Date().toISOString()}] Cobranças automáticas executadas.`);
});