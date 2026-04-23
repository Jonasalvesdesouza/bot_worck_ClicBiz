const { DELAY } = require('../config/env');

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function randomDelay() {
  const ms = DELAY + Math.floor(Math.random() * 4000);
  return delay(ms); 
}

module.exports = { delay, randomDelay };