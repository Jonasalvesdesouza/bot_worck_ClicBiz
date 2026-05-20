const { convertCsvToJson } = require('./csvConverter');
const { saveJson, loadJson } = require('./jsonService');
const { validateBatch } = require('./validationService');
const { processSend } = require('../processors/sendProcessor');

async function run() {
  console.log('🚀 Iniciando orquestrador...');
  const customers = await convertCsvToJson();
  await saveJson(customers);
  const allCustomers = await loadJson();

  const uniquePhones = [...new Set(allCustomers.map(c => c.phone))];
  const validations = await validateBatch(uniquePhones);
  const validMap = new Map(validations.map((v, idx) => [uniquePhones[idx], v.valid]));
  const validCustomers = allCustomers.filter(c => validMap.get(c.phone) === true);
  console.log(`📞 Válidos: ${validCustomers.length} de ${allCustomers.length}`);
  await processSend(validCustomers);
}

module.exports = { run };