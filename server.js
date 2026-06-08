const MAX_REWIND = 200;

const history = {}; // position snapshots per player

function saveHistory(p) {
  if (!history[p.id]) history[p.id] = [];
  history[p.id].push({
    t: Date.now(),
    x: p.x,
    y: p.y,
    z: p.z
  });

  if (history[p.id].length > 60) history[p.id].shift();
}

// 🔥 REWIND FUNCTION (CS STYLE)
function rewindPlayer(id, time) {
  const h = history[id];
  if (!h) return null;

  let closest = h[0];

  for (let i = 0; i < h.length; i++) {
    if (Math.abs(h[i].t - time) < Math.abs(closest.t - time)) {
      closest = h[i];
    }
  }

  return closest;
}

// 🔫 CS-STYLE HIT CHECK
function checkHit(shooter, shot) {

  for (const id in players) {
    if (id === shooter) continue;

    const target = players[id];

    const rewound = rewindPlayer(id, shot.t);

    if (!rewound) continue;

    const dx = rewound.x - shot.x;
    const dy = (rewound.y + 1.6) - shot.y;
    const dz = rewound.z - shot.z;

    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

    if (dist < 1.2) {
      return id;
    }
  }

  return null;
}