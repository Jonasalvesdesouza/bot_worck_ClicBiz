const { convertCsvToJson } = require('../utils/csvConverter');
const { validateBatch } = require('./validationService');
const { processSend } = require('../processors/sendProcessor');

async function run() {
  console.log('🚀 Iniciando orquestrador...');
  const allCustomers = await convertCsvToJson();

  const uniquePhones = [...new Set(allCustomers.map(c => c.phone))];
  const validations = await validateBatch(uniquePhones);
  const validMap = new Map(uniquePhones.map((phone, idx) => [phone, validations[idx].valid]));
  const validCustomers = allCustomers.filter(c => validMap.get(c.phone) === true);

  console.log(`📞 Válidos: ${validCustomers.length} de ${allCustomers.length}`);
  await processSend(validCustomers);
}

module.exports = { run };