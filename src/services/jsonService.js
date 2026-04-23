const fs = require('fs');

const JSON_PATH = 'data/client.json';

function saveJson(dados, caminho = JSON_PATH) {
  fs.writeFileSync(caminho, JSON.stringify(dados, null, 2), 'utf-8');
}

function loadJson(caminho = JSON_PATH) {
  const raw = fs.readFileSync(caminho, 'utf-8');
  return JSON.parse(raw);
}

module.exports = { saveJson, loadJson };