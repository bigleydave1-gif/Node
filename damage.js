const { HITBOXES } = require("./hitboxes");

function applyDamage(player, hitbox) {

  const base = 25;

  let multiplier = HITBOXES[hitbox].dmg;

  let damage = base * multiplier;

  // optional armor system
  if (player.armor && hitbox !== "head") {
    damage *= 0.7;
  }

  player.hp -= damage;

  if (player.hp <= 0) {
    player.dead = true;
  }

  return damage;
}

module.exports = { applyDamage };