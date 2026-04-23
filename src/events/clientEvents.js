const qrcode = require('qrcode-terminal');
const client = require('../client/whatsappClient');
const { convertCsvToJson } = require('../services/csvService');
const { loadJson } = require('../services/jsonService');
const { processSend } = require('../processors/sendProcessor');

function startEvents() {
  client.on('qr', qr => {
    console.log('📷 Escaneie o QR Code abaixo:');
    qrcode.generate(qr, { small: true });
  });

  // ✅ ADICIONADO: monitora progresso de carregamento
  client.on('loading_screen', (percent, message) => {
    console.log(`⏳ Carregando WhatsApp: ${percent}% — ${message}`);
  });

  // ✅ ADICIONADO: confirma autenticação bem-sucedida
  client.on('authenticated', () => {
    console.log('🔐 Autenticado com sucesso!');
  });

  // ✅ ADICIONADO: captura falha de autenticação (sessão expirada, QR não escaneado etc.)
  client.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticação:', msg);
    console.error('👉 Apague a pasta .wwebjs_auth e escaneie o QR Code novamente.');
  });

  // ✅ ADICIONADO: captura desconexão inesperada
  client.on('disconnected', (reason) => {
    console.warn('🔌 Cliente desconectado. Motivo:', reason);
  });

  client.on('ready', async () => {
    console.log('✅ Bot pronto e conectado!');

    try {
      await convertCsvToJson();           // 1️⃣ CSV -> JSON
      const customers = loadJson();       // 2️⃣ lê o JSON
      console.log(`📋 ${customers.length} cliente(s) carregado(s)`);
      await processSend(customers);       // 3️⃣ agrupa por phone e envia
    } catch (err) {
      console.error('❌ Erro durante o processamento:', err);
    } finally {
      // ✅ CORRIGIDO: destroy dentro do finally garante que sempre roda,
      //    mas só APÓS o processSend terminar completamente
      console.log('🔒 Encerrando conexão...');
      client.destroy();
    }
  });
}

module.exports = { startEvents };