const fs = require('fs').promises;
const path = require('path');

const JSON_PATH = 'data/client.json';

async function saveJson(dados, caminho = JSON_PATH) {
  const dir = path.dirname(caminho);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(caminho, JSON.stringify(dados, null, 2));
  console.log(`💾 ${dados.length} registros salvos em ${caminho}`);
}

async function loadJson(caminho = JSON_PATH) {
  try {
    const raw = await fs.readFile(caminho, 'utf-8');
    return JSON.parse(raw);
  } catch {
    throw new Error(`JSON não encontrado: ${caminho}. Execute conversão primeiro.`);
  }
}

module.exports = { saveJson, loadJson };