// utils/runGuard.js
// Impede que o bot envie mensagens mais de uma vez por dia.
// Salva a data do último envio em data/last_run.json e bloqueia
// novas execuções caso o arquivo já registre o dia atual.

const fs   = require('fs');
const path = require('path');

const GUARD_FILE = 'data/last_run.json';

/**
 * Verifica se o bot já foi executado hoje.
 * @returns {boolean}
 */
function jaRodouHoje() {
  if (!fs.existsSync(GUARD_FILE)) return false;

  try {
    const { date } = JSON.parse(fs.readFileSync(GUARD_FILE, 'utf-8'));
    const hoje = new Date().toISOString().slice(0, 10); // "2025-05-15"
    return date === hoje;
  } catch {
    // arquivo corrompido — permite execução e será sobrescrito
    return false;
  }
}

/**
 * Registra a data de hoje como última execução.
 * Deve ser chamado logo antes de encerrar a conexão.
 */
function registrarExecucao() {
  const hoje = new Date().toISOString().slice(0, 10);

  // Garante que a pasta existe
  const dir = path.dirname(GUARD_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(GUARD_FILE, JSON.stringify({ date: hoje }, null, 2), 'utf-8');
  console.log(`📅 Execução registrada: ${hoje}`);
}

module.exports = { jaRodouHoje, registrarExecucao };