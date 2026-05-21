const { startEvents, gracefulShutdown } = require('./events/clientEvents');

startEvents();

process.on('SIGINT', () => gracefulShutdown(0));
process.on('SIGTERM', () => gracefulShutdown(0));