const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db.json');

function lerDB() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function salvarDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function verificarDividasVencendo() {
  const db = lerDB();
  const hoje = new Date();
  const clientesParaNotificar = [];

  db.clientes.forEach(cliente => {
    cliente.dividas.forEach(divida => {
      if (divida.status !== 'pendente') return;
      
      const vencimento = new Date(divida.vencimento);
      const diffDias = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
      
      // Configuração: avisar 3 dias antes
      if (diffDias <= 3 && diffDias >= 0) {
        clientesParaNotificar.push({
          id: cliente.id,
          nome: cliente.nome,
          divida
        });
      }
    });
  });
  
  return clientesParaNotificar;
}

module.exports = { verificarDividasVencendo, lerDB, salvarDB };