const fs = require('fs');

function saveJson(dados, caminho = 'data/client.json') {
  fs.writeFileSync(
    caminho,
    JSON.stringify(dados, null, 2),
    'utf-8'
  );
}

module.exports = { saveJson };