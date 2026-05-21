const {  DELAY_BETWEEN_MESSAGES, JITTER_MAX_MS } = require('../config/env');

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function randomDelay() {
  const jitter = JITTER_MAX_MS ? Math.random() * JITTER_MAX_MS : 0;
  const ms =  DELAY_BETWEEN_MESSAGES + jitter;
  console.log(`⏱️  Aguardando ${Math.round(ms / 1000)}s antes do próximo envio...`);
  return delay(ms);
}

module.exports = { delay, randomDelay };