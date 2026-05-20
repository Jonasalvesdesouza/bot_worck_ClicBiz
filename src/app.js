const client = require('./client/whatsappClient');
const { startEvents, gracefulShutdown } = require('./events/clientEvents');

startEvents();
client.initialize();

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);