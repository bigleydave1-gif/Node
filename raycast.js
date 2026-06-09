const { getHitbox } = require("./hitboxes");

function raycastShot(shooterId, shot, players, rewindFn) {

  let hits = [];

  for (const id in players) {

    if (id === shooterId) continue;

    const p = players[id];

    // rewind target for lag compensation
    const rewound = rewindFn(id, shot.t);
    if (!rewound) continue;

    // ray origin
    const origin = { x: shot.x, y: shot.y, z: shot.z };

    const dir = {
      x: shot.dx,
      y: shot.dy,
      z: shot.dz
    };

    // simple parametric ray test
    const t = 1.0;

    const hitPoint = {
      x: origin.x + dir.x * t,
      y: origin.y + dir.y * t,
      z: origin.z + dir.z * t
    };

    const hb = getHitbox(hitPoint, rewound);

    hits.push({
      id,
      hitbox: hb,
      point: hitPoint
    });
  }

  return hits;
}

module.exports = { raycastShot };