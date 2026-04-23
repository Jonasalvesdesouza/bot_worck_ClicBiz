const client = require('../client/whatsappClient');
const { delay } = require('../utils/delay');

async function sendMessage(phone, message) {
  const wid = `${phone}@c.us`;

  // ✅ ADICIONADO: log do WID antes de tentar enviar (facilita debug)
  console.log(`🔄 Tentando enviar para: ${wid}`);

  try {
    await delay(1000);
    const result = await client.sendMessage(wid, message);

    // ✅ ADICIONADO: confirma com ID da mensagem retornado pelo WhatsApp
  console.log(`✅ Mensagem enviada para ${phone} — ID: ${result?.id?._serialized ?? 'N/A'}`);
  } catch (err) {
    // ✅ CORRIGIDO: usa console.error (não warn) e relança o erro
    //    para que sendProcessor possa registrar e continuar corretamente
    console.error(`❌ Erro ao enviar para ${phone}:`, err.message);
    throw err; // relança para o processSend tratar no seu próprio try/catch
  }
}

module.exports = { sendMessage };