const fs = require('fs');
const path = require('path');

const JSON_PATH = 'data/client.json';

// ✅ CORRIGIDO: arquivo unificado com saveJson + loadJson no mesmo lugar.
//    Havia dois arquivos conflitantes — agora há apenas um, usado por
//    csvService.js e clientEvents.js.

function saveJson(dados, caminho = JSON_PATH) {
  // Garante que a pasta existe antes de escrever
  const dir = path.dirname(caminho);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(caminho, JSON.stringify(dados, null, 2), 'utf-8');
  console.log(`💾 JSON salvo em: ${caminho} (${dados.length} registro(s))`);
}

function loadJson(caminho = JSON_PATH) {
  if (!fs.existsSync(caminho)) {
    throw new Error(`❌ Arquivo JSON não encontrado: ${caminho}. Execute convertCsvToJson() primeiro.`);
  }
  const raw = fs.readFileSync(caminho, 'utf-8');
  return JSON.parse(raw);
}

module.exports = { saveJson, loadJson };