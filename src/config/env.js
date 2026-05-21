require('dotenv').config();

module.exports = {
  // Sessão
  SESSION: process.env.SESSION || 'production',

  // Arquivos
  CSV_FILE: process.env.CSV_FILE || 'data/client.csv',
  CSV_SEPARATOR: process.env.CSV_SEPARATOR || ';',
  MULTI_VALUE_SEPARATOR: process.env.MULTI_VALUE_SEPARATOR || '|', // NOVO: separador para múltiplos valores

  // Delays
  DELAY_BETWEEN_MESSAGES: Number(process.env.DELAY_BETWEEN_MESSAGES) || 60000,
  JITTER_MAX_MS: Number(process.env.JITTER_MAX_MS) || 10000,

  // Validação
  VALIDATION_CONCURRENCY: Number(process.env.VALIDATION_CONCURRENCY) || 5,

  // Reconexão
  MAX_RECONNECT_ATTEMPTS: Number(process.env.MAX_RECONNECT_ATTEMPTS) || 5,
  RECONNECT_BASE_DELAY_MS: Number(process.env.RECONNECT_BASE_DELAY_MS) || 5000,
};
