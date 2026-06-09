// hitreg.js
// CS2-style lag compensated hit detection

let players = null;
let history = null;

function bindServerState(_players, _history) {
  players = _players;
  history = _history;
}

// find closest past position (rewind)
function getRewindPosition(id, targetTime) {
  const h = history[id];
  if (!h || h.length === 0) return null;

  let best = h[0];

  for (let i = 0; i < h.length; i++) {
    if (Math.abs(h[i].t - targetTime) < Math.abs(best.t - targetTime)) {
      best = h[i];
    }
  }

  return best;
}

// main hit check
function handleShot(shooterId, shot) {

  const shotTime = shot.t;

  for (const id in players) {

    if (id === shooterId) continue;

    const rewound = getRewindPosition(id, shotTime);
    if (!rewound) continue;

    const dx = rewound.x - shot.x;
    const dy = (rewound.y + 1.6) - shot.y;
    const dz = rewound.z - shot.z;

    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (dist < 1.2) {
      console.log("HIT:", id);
      // TODO: apply damage / health system
    }
  }
}

module.exports = {
  handleShot,
  bindServerState
};