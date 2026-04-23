const fs = require('fs');
const csv = require('csv-parser');
const { CSV_FILE, CSV_SEPARATOR } = require('../config/env');
const { extractPhone, extractContact } = require('../utils/phone');
const { saveJson } = require('./jsonService');

function convertCsvToJson() {
  return new Promise((resolve, reject) => {
    const customers = [];
    fs.createReadStream(CSV_FILE)
      .pipe(csv({ separator: CSV_SEPARATOR }))
      .on('data', (row) => {
        const rawPhone = row['Tel - Contato'];
        const phone = extractPhone(rawPhone);
        const contact = extractContact(rawPhone);
        if (!phone) return;
        customers.push({
          phone,
          contact,
          codCliente: row['Cod Cliente'],
          company: row['Nome Cliente'],
          value: row['Valor Atrasado'].trim(), // ✅ usa o valor do CSV sem adicionar R$
          delayDays: Number(row['Dias de Atraso']) || 0
        });
      })
      .on('end', () => {
        saveJson(customers);
        resolve();
      })
      .on('error', reject);
  });
}

module.exports = { convertCsvToJson };