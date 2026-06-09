// rewind.js
// Stores historical player positions for lag compensation

const history = {};

// store snapshots every tick
function saveHistory(id, player, t) {

  if (!history[id]) history[id] = [];

  history[id].push({
    t,
    x: player.x,
    y: player.y,
    z: player.z
  });

  // limit memory
  if (history[id].length > 120) {
    history[id].shift();
  }
}

// find closest snapshot to shot time
function getRewindPosition(historyTable, id, targetTime) {

  const h = historyTable[id];
  if (!h || h.length === 0) return null;

  let best = h[0];

  for (let i = 0; i < h.length; i++) {
    if (Math.abs(h[i].t - targetTime) < Math.abs(best.t - targetTime)) {
      best = h[i];
    }
  }

  return best;
}

module.exports = {
  history,
  saveHistory,
  getRewindPosition
};