const client = require('../client/whatsappClient');
const { jaRodouHoje, registrarExecucao } = require('../utils/runGuard');
const { setShuttingDown } = require('../services/validationService');
const { run } = require('../services/orchestrator');

let jaProcessou = false;
let isShuttingDown = false;

function startEvents() {
  client.on('qr', (qr) => {
    console.log('📱 Escaneie o QR Code:');
    require('qrcode-terminal').generate(qr, { small: true });
  });

  client.on('ready', async () => {
    console.log('✅ EVENTO READY DISPARADO');
    
    try {
      if (jaProcessou) return;
      jaProcessou = true;
  
      console.log('✅ WhatsApp conectado!');
      if (await jaRodouHoje()) {
        console.log('🚫 Já executado hoje. Encerrando.');
        await gracefulShutdown();
        return;
      }
  
      await run(); // orquestrador principal
      await registrarExecucao();
    } catch (err) {
      console.error('❌ Erro fatal no evento ready:', err.message);
      await gracefulShutdown(1);
    } finally {
      await gracefulShutdown();
    }
  });
  
  client.on('message_ack', (ack) => {
    console.log(`📬 ACK para ${ack.id.id} | Status: ${ack.ack}`);
    // ack.ack: 0 = enviado, 1 = entregue ao servidor, 2 = entregue ao dispositivo, 3 = lido
  });
  client.on('auth_failure', (msg) => console.error('❌ Auth falhou:', msg));
  client.on('disconnected', (reason) => console.warn('⚠️ Desconectado:', reason));
}

async function gracefulShutdown(exitCode = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  setShuttingDown(true);
  console.log('🛑 Finalizando...');
  try {
    await client.destroy();
    console.log('👋 Cliente encerrado.');
  } catch (err) {
    console.warn('⚠️ Erro ao destruir cliente:', err.message);
  }
  process.exit(exitCode);
}

module.exports = { startEvents, gracefulShutdown };