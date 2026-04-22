const client = require('./client/whatsappClient');
const { startEvents } = require('./events/clientEvents');

startEvents();
client.initialize();