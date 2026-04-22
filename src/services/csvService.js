const fs = require('fs');
const csv = require('csv-parser');
const { CSV_FILE, CSV_SEPARATOR } = require('../config/env');
const { extractPhone, extractContact } = require('../utils/phone');

function loadCustomers() {
  return new Promise((resolve, reject) => {
    const customers = [];

    fs.createReadStream(CSV_FILE)
      .pipe(csv({ separator: CSV_SEPARATOR }))
      .on('data', (row) => {
        const phone = extractPhone(row['Phone - Contact']);
        const contact = extractContact(row['Phone - Contact']);

        if (!phone) return;

        customers.push({
          phone,
          contact,
          name: row['Vame Client'],
          value: row['Overdue amount'],
          delayDays: Number(row['Days of Delay']) || 0
        });
      })
      .on('end', () => resolve(customers))
      .on('error', reject);
  });
}

module.exports = { loadCustomers };