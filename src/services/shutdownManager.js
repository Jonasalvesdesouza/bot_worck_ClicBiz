let isShuttingDown = false;

function setShuttingDown(state) {
  isShuttingDown = state;
}

function getShuttingDown() {
  return isShuttingDown;
}

module.exports = { setShuttingDown, getShuttingDown };