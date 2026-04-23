const fs = require('fs');
const csv = require('csv-parser');
const iconv = require('iconv-lite');        // ✅ converte Windows-1252 → UTF-8
const { CSV_FILE, CSV_SEPARATOR } = require('../config/env');
const { extractPhone, extractContact } = require('../utils/phone');
const { saveJson } = require('./jsonService');

function convertCsvToJson() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CSV_FILE)) {
      return reject(new Error(`❌ Arquivo CSV não encontrado: ${CSV_FILE}`));
    }

    const customers = [];

    fs.createReadStream(CSV_FILE)
      .pipe(iconv.decodeStream('win1252'))  // ✅ decodifica antes do csv-parser
      .pipe(csv({ separator: CSV_SEPARATOR }))
      .on('data', (row) => {
        const rawPhone = row['Tel - Contato'];

        if (!rawPhone) {
          console.warn('⚠️ Linha sem telefone ignorada:', row);
          return;
        }

        const phone = extractPhone(rawPhone);
        const contact = extractContact(rawPhone);

        if (!phone) {
          console.warn(`⚠️ Telefone inválido ignorado: "${rawPhone}"`);
          return;
        }

        const rawValue = row['Valor Atrasado'];
        if (!rawValue) {
          console.warn(`⚠️ Valor ausente para: ${row['Nome Cliente']}`);
          return;
        }

        customers.push({
          phone,
          contact,
          codCliente: row['Cod Cliente'],
          company: row['Nome Cliente'],
          value: rawValue.trim(),
          delayDays: Number(row['Dias de Atraso']) || 0,
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

module.exports = { convertCsvToJson };