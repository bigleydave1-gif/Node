const bullets = [];

function spawnBullet(data) {
  bullets.push({
    ...data,
    alive: true,
    traveled: 0
  });
}

function simulateBullets(dt) {

  const speed = 120; // units/sec

  for (const b of bullets) {

    if (!b.alive) continue;

    b.x += b.dx * speed * dt;
    b.y += b.dy * speed * dt;
    b.z += b.dz * speed * dt;

    b.traveled += speed * dt;

    if (b.traveled > 200) {
      b.alive = false;
    }
  }
}

module.exports = { bullets, spawnBullet, simulateBullets };