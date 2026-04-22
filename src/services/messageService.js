const { getGreeting } = require('../utils/greeting');

function generateMessage(group) {
  const greeting = getGreeting();
  const name = group[0].contact;

  const maxDelay = Math.max(...group.map(g => g.delayDays));

  const list = group.map(item =>
    `• ${item.name} – ${item.delayDays} days – ${item.value}`
  ).join('\n');

  if (maxDelay > 90) {
    return `${greeting}, ${name}!

${list}

We need urgent payment.`;
  }

  return `${greeting}, ${name}!

${list}

Do you have a payment forecast?`;
}

module.exports = { generateMessage };