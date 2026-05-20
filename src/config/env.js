require('dotenv').config();

module.exports = {
  SESSION: process.env.SESSION || 'production',
  CSV_FILE: process.env.CSV_FILE || 'data/client.csv',
  CSV_SEPARATOR: process.env.CSV_SEPARATOR || ';',
  DELAY: Number(process.env.DELAY_BETWEEN_MESSAGES) || 60000,
  JITTER_MAX_MS: Number(process.env.JITTER_MAX_MS) || 10000
};

