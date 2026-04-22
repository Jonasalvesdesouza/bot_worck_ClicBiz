const { generateMessage } = require('../services/messageService');
const { sendMessage } = require('../services/sendService');
const { isValidNumber } = require('../services/validationService');
const { randomDelay } = require('../utils/delay');

function groupByPhone(customers) {
  const map = {};

  for (const c of customers) {
    if (!map[c.phone]) map[c.phone] = [];
    map[c.phone].push(c);
  }

  return Object.values(map);
}

async function processSend(customers) {
  const groups = groupByPhone(customers);

  for (const group of groups) {
    const phone = group[0].phone;

    const valid = await isValidNumber(phone);
    if (!valid) continue;

    const message = generateMessage(group);

    await sendMessage(phone, message);
    await randomDelay();
  }
}

module.exports = { processSend };