const fs = require('fs');
const csv = require('csv-parser');
const iconv = require('iconv-lite');
const { CSV_FILE, CSV_SEPARATOR } = require('../config/env');
const { extractPhone, extractContact } = require('../utils/phone');
const { saveJson, loadJson } = require('../services/jsonService');
const { normalizeName } = require('../utils/normalizeName');
const client = require('../client/whatsappClient');
const { processSend } = require('../processors/sendProcessor'); // ✅ caminho corrigido

// ✅ Flag para imprimir as colunas apenas na primeira linha (evita spam no log)
let headersLogado = false;

function convertCsvToJson() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CSV_FILE)) {
      return reject(new Error(`❌ Arquivo CSV não encontrado: ${CSV_FILE}`));
    }

    headersLogado = false;
    const customers = [];

    fs.createReadStream(CSV_FILE)
      .pipe(iconv.decodeStream('win1252'))
      .pipe(csv({ separator: CSV_SEPARATOR }))
      .on('data', (rawRow) => {

        // ✅ CORREÇÃO: normaliza todas as chaves e valores
        //    Remove BOM (\uFEFF), espaços extras e normaliza para UTF-8
        const row = Object.fromEntries(
          Object.entries(rawRow).map(([k, v]) => [
            k.trim().replace(/^\uFEFF/, ''),
            typeof v === 'string' ? v.trim() : v,
          ])
        );

        // 🔍 DIAGNÓSTICO: imprime as colunas reais na primeira linha
        if (!headersLogado) {
          console.log('🗂️  Colunas encontradas no CSV:');
          Object.keys(row).forEach(col => console.log(`   → "${col}"`));
          headersLogado = true;
        }

        const rawPhone = row['Tel - Contato'];

        if (!rawPhone) {
          console.warn('⚠️ Linha sem telefone ignorada:', row);
          return;
        }

        const phone = extractPhone(rawPhone);
        const contact = normalizeName(extractContact(rawPhone));

        if (!phone) {
          console.warn(`⚠️ Telefone inválido ignorado: "${rawPhone}"`);
          return;
        }

        const rawValue = row['Valor Atrasado'];
        if (!rawValue) {
          // 🔍 DIAGNÓSTICO: mostra o valor bruto da coluna para identificar o problema
          console.warn(`⚠️ Valor ausente para: ${row['Nome Cliente']} | Valor bruto: "${rawRow['Valor Atrasado']}" | Valor trim: "${row['Valor Atrasado']}"`);
          return;
        }

        customers.push({
          phone,
          contact,
          codCliente:   row['Cod Cliente'],
          company:      row['Nome Cliente'],
          overdueCount: Number(row['Qtd Títulos Atrasados']) || 0,
          value:        rawValue,
          delayDays:    Number(row['Dias de Atraso']) || 0,
        });
      })
      .on('end', () => {
        console.log(`📂 CSV lido: ${customers.length} cliente(s) válido(s)`);
        saveJson(customers);
        resolve();
      })
      .on('error', (err) => {
        console.error('❌ Erro ao ler CSV:', err.message);
        reject(err);
      });
  });
}

function startEvents() {
  client.on('qr', (qr) => {
    console.log('📱 QR Code gerado — escaneie pelo WhatsApp:');
    // Descomente a linha abaixo se instalar o pacote qrcode-terminal:
    // require('qrcode-terminal').generate(qr, { small: true });
    console.log(qr);
  });

  client.on('ready', async () => {
    console.log('✅ WhatsApp conectado! Iniciando processamento...');
    try {
      await convertCsvToJson();
      const customers = loadJson();
      await processSend(customers);
    } catch (err) {
      console.error('❌ Erro durante o processamento:', err.message);
    } finally {
      console.log('🔌 Encerrando conexão...');
      client.destroy();
    }
  });

  client.on('auth_failure', (msg) => {
    console.error('❌ Falha de autenticação:', msg);
  });

  client.on('disconnected', (reason) => {
    console.warn('⚠️ Cliente desconectado:', reason);
  });
}

module.exports = { convertCsvToJson, startEvents };