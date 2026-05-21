const fs = require('fs');
const csv = require('csv-parser');
const iconv = require('iconv-lite');
const { CSV_FILE, CSV_SEPARATOR, MULTI_VALUE_SEPARATOR } = require('../config/env');
const { extractPhone, extractContact } = require('./phone');
const { normalizeName } = require('./normalizeName');

function splitMultiValue(value) {
  if (!value || typeof value !== 'string') return [];
  return value.split(MULTI_VALUE_SEPARATOR).map(v => v.trim()).filter(v => v !== '');
}

function normalizeColumnName(name) {
  return name.trim().replace(/^\uFEFF/, '').replace(/\s+/g, ' ').trim();
}

function sanitizeNumber(value, defaultValue = 0) {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

async function convertCsvToJson() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CSV_FILE)) {
      return reject(new Error(`Arquivo CSV não encontrado: ${CSV_FILE}`));
    }

    const customers = [];
    let headersLogged = false;

    fs.createReadStream(CSV_FILE)
      .pipe(iconv.decodeStream('win1252'))
      .pipe(csv({ separator: CSV_SEPARATOR }))
      .on('data', (rawRow) => {
        const row = {};
        for (const [key, value] of Object.entries(rawRow)) {
          const normalizedKey = normalizeColumnName(key);
          row[normalizedKey] = value?.trim() || '';
        }

        if (!headersLogged) {
          console.log('🗂️ Colunas normalizadas:', Object.keys(row).join(', '));
          headersLogged = true;
        }

        const nomeCliente = row['Nome Cliente'] || '';
        if (!nomeCliente) return;

        const phone = extractPhone(nomeCliente);
        if (!phone) {
          console.warn(`⚠️ Telefone inválido em Nome Cliente: ${nomeCliente}`);
          return;
        }

        const contact = normalizeName(extractContact(nomeCliente));
        const rawValue = row['Valor Atrasado'] || '';
        if (!rawValue) {
          console.warn(`⚠️ Linha sem Valor Atrasado para ${phone}, ignorada`);
          return;
        }

        const company = row['Empresa'] || 'Empresa não informada';
        const delayDays = sanitizeNumber(row['Dias de Atraso'], 0);

        // Processa boletos com separador configurável
        const titulosRaw = row['Título'] || '';
        const datasRaw = row['Dt Venc'] || '';
        const valoresRaw = row['Vl Título'] || '';

        const titulos = splitMultiValue(titulosRaw);
        const datas = splitMultiValue(datasRaw);
        const valores = splitMultiValue(valoresRaw);

        let boletos = [];
        const maxLen = Math.max(titulos.length, datas.length, valores.length);
        if (maxLen === 0 && (titulosRaw || datasRaw || valoresRaw)) {
          // Caso singular sem separador
          boletos.push({
            titulo: titulosRaw || 'Título não informado',
            situacao: row['Situação'] || '',
            dtVenc: datasRaw,
            vlTitulo: valoresRaw,
          });
        } else {
          for (let i = 0; i < maxLen; i++) {
            const titulo = titulos[i] || (i === 0 ? titulosRaw : '');
            const dtVenc = datas[i] || (i === 0 ? datasRaw : '');
            const vlTitulo = valores[i] || (i === 0 ? valoresRaw : '');
            if (titulo || dtVenc || vlTitulo) {
              boletos.push({
                titulo: titulo || 'Título não informado',
                situacao: row['Situação'] || '',
                dtVenc,
                vlTitulo,
              });
            }
          }
        }

        customers.push({
          phone,
          contact,
          company,
          valorComJuros: rawValue,
          delayDays,
          boletos,
        });
      })
      .on('end', () => {
        console.log(`📂 ${customers.length} clientes válidos extraídos do CSV`);
        const totalBoletos = customers.reduce((acc, c) => acc + c.boletos.length, 0);
        console.log(`📄 Total de boletos: ${totalBoletos}`);
        resolve(customers);
      })
      .on('error', reject);
  });
}

module.exports = { convertCsvToJson };