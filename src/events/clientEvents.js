const { getClient, resetClient } = require('../client/whatsappClient');
const { jaRodouHoje, registrarExecucao } = require('../utils/runGuard');
const { setShuttingDown, getShuttingDown } = require('../services/shutdownManager');
const { run } = require('../services/orchestrator');
const { delay } = require('../utils/delay');
const { MAX_RECONNECT_ATTEMPTS, RECONNECT_BASE_DELAY_MS } = require('../config/env');

let processing = false;
let reconnectAttempts = 0;
let isManualShutdown = false;

// Mutex simples
let processingMutex = Promise.resolve();

function withMutex(fn) {
  let resolve;
  const wait = new Promise(r => { resolve = r; });
  const oldResolve = processingMutex;
  processingMutex = processingMutex.then(() => wait);
  return oldResolve.then(() => fn().finally(resolve));
}

async function executeOnce() {
  return withMutex(async () => {
    if (processing) {
      console.log('⏳ Já processando, ignorando novo ready');
      return false;
    }
    processing = true;
    try {
      if (await jaRodouHoje()) {
        console.log('🚫 Já executado hoje. Encerrando.');
        await gracefulShutdown(0);
        return false;
      }
      await run();
      await registrarExecucao();
      await gracefulShutdown(0);
      return true;
    } catch (err) {
      console.error('❌ Erro fatal no evento ready:', err.message);
      await gracefulShutdown(1);
      return false;
    } finally {
      processing = false;
    }
  });
}

function attachEventHandlers(client) {
    // ... qr, ready, auth_failure, disconnected

  // NOVO: listener de ACK registrado aqu
  client.on('qr', (qr) => {
    console.log('📱 Escaneie o QR Code:');
    require('qrcode-terminal').generate(qr, { small: true });
  });

  client.on('ready', async () => {
    console.log('✅ EVENTO READY DISPARADO');
    reconnectAttempts = 0;
    await executeOnce();
  });

  client.on('message_ack', (ack) => {
    console.log(`📬 ACK para ${ack.id.id} | Status: ${ack.ack}`);
  });

  client.on('auth_failure', (msg) => {
    console.error('❌ Auth falhou:', msg);
    gracefulShutdown(1);
  });

  client.on('disconnected', async (reason) => {
    console.warn(`⚠️ Desconectado: ${reason}`);
    if (isManualShutdown || getShuttingDown()) return;

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      const delayMs = RECONNECT_BASE_DELAY_MS * Math.pow(2, reconnectAttempts);
      reconnectAttempts++;
      console.log(`🔄 Tentativa de reconexão ${reconnectAttempts} em ${delayMs/1000}s...`);
      await delay(delayMs);
      await initializeClient();
    } else {
      console.error('❌ Número máximo de tentativas atingido. Encerrando.');
      await gracefulShutdown(1);
    }
  });
}

// Modificar sendProcessor para receber ackPromises via closure
// Ou exportar ackPromises e passar adiante.

async function initializeClient() {
  await resetClient(); // destrói cliente antigo se existir
  const client = getClient(); // cria novo
  attachEventHandlers(client);
  client.initialize();
}

async function gracefulShutdown(exitCode = 0) {
  if (isManualShutdown) return;
  isManualShutdown = true;
  setShuttingDown(true);
  console.log('🛑 Finalizando...');
  try {
    const client = getClient();
    if (client) await client.destroy();
    console.log('👋 Cliente encerrado.');
  } catch (err) {
    console.warn('⚠️ Erro ao destruir cliente:', err.message);
  }
  process.exit(exitCode);
}

function startEvents() {
  initializeClient();
}

module.exports = { startEvents, gracefulShutdown };