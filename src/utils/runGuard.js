const fs = require('fs').promises;
const path = require('path');

const GUARD_FILE = 'data/last_run.json';

function getBrazilDate() {
  return new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    .split('/').reverse().join('-'); // YYYY-MM-DD
}

async function jaRodouHoje() {
  try {
    const data = await fs.readFile(GUARD_FILE, 'utf-8');
    const { date } = JSON.parse(data);
    return date === getBrazilDate();
  } catch {
    return false;
  }
}

async function registrarExecucao() {
  const hoje = getBrazilDate();
  const dir = path.dirname(GUARD_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(GUARD_FILE, JSON.stringify({ date: hoje }, null, 2));
  console.log(`📅 Execução registrada: ${hoje}`);
}

module.exports = { jaRodouHoje, registrarExecucao };