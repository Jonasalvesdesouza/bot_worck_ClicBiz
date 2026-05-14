const qrcode = require('qrcode-terminal');
const client = require('../client/whatsappClient');
const { convertCsvToJson } = require('../services/csvService');
const { loadJson } = require('../services/jsonService');
const { processSend } = require('../processors/sendProcessor');

let isRunning = false;
let isDone    = false; // ✅ FIX: impede reexecução após destroy intencional

function startEvents() {
  client.on('qr', qr => {
    console.log('📷 Escaneie o QR Code abaixo:');
    qrcode.generate(qr, { small: true });
  });

  client.on('loading_screen', (percent, message) => {
    console.log(`⏳ Carregando WhatsApp: ${percent}% — ${message}`);
  });

  client.on('authenticated', () => {
    console.log('🔐 Autenticado com sucesso!');
  });

  client.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticação:', msg);
    console.error('👉 Apague a pasta .wwebjs_auth e escaneie o QR Code novamente.');
  });

  client.on('disconnected', (reason) => {
    console.warn('🔌 Cliente desconectado. Motivo:', reason);
    // ✅ FIX: só reseta isRunning se NÃO foi um encerramento intencional.
    //    Antes, o destroy() disparava 'disconnected' → isRunning = false →
    //    reconexão → 'ready' → enviava tudo de novo (loop).
    if (!isDone) {
      isRunning = false;
    }
  });

  client.on('ready', async () => {
    // ✅ FIX: bloqueia se já está rodando OU se já terminou
    if (isRunning || isDone) {
      console.warn('⚠️ Evento "ready" ignorado — processo já executado ou em andamento.');
      return;
    }
    isRunning = true;

    console.log('✅ Bot pronto e conectado!');

    try {
      await convertCsvToJson();           // 1️⃣ CSV -> JSON
      const customers = loadJson();       // 2️⃣ lê o JSON
      console.log(`📋 ${customers.length} cliente(s) carregado(s)`);
      await processSend(customers);       // 3️⃣ agrupa por phone e envia
    } catch (err) {
      console.error('❌ Erro durante o processamento:', err);
    } finally {
      isDone = true; // ✅ marca ANTES do destroy para travar o evento 'disconnected'
      console.log('🔒 Encerrando conexão...');
      await client.destroy();
    }
  });
}

module.exports = { startEvents };