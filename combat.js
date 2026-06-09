const { spawnBullet } = require("./bullets");
const { getRecoil } = require("./recoil");
const { applyDamage } = require("./damage");
const { raycastShot } = require("./raycast");

const fireCooldown = {};

function shoot(shooterId, shot, players, weaponData, rewindFn) {

  const now = Date.now();

  if (!fireCooldown[shooterId]) fireCooldown[shooterId] = 0;

  const weapon = weaponData[shot.weapon];

  if (now < fireCooldown[shooterId]) return;

  fireCooldown[shooterId] = now + (60000 / weapon.fireRate);

  const recoil = getRecoil(shooterId, weapon, shot.index || 0);

  const dir = {
    x: shot.dx + recoil.x,
    y: shot.dy + recoil.y,
    z: shot.dz
  };

  spawnBullet({
    shooterId,
    x: shot.x,
    y: shot.y,
    z: shot.z,
    dx: dir.x,
    dy: dir.y,
    dz: dir.z,
    t: shot.t,
    weapon: shot.weapon
  });

  // instant validation pass (server authoritative hit)
  const hits = raycastShot(shooterId, { ...shot, ...dir }, players, rewindFn);

  for (const h of hits) {

    const target = players[h.id];
    if (!target) continue;

    const dmg = applyDamage(target, h.hitbox);

    console.log(`💥 ${shooterId} hit ${h.id} for ${dmg}`);
  }
}

module.exports = { shoot };