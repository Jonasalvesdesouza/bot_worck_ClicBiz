const { DELAY } = require('../config/env');

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function randomDelay() {
  return DELAY + Math.floor(Math.random() * 4000);
}

module.exports = { delay, randomDelay };