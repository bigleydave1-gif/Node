const { raycastShot } = require("./raycast");
const { applyDamage } = require("./damage");

function createWeaponSystem(players, rewindFn) {

  return {

    shoot(shooterId, shot) {

      const shooter = players[shooterId];
      if (!shooter) return;

      const hits = raycastShot(
        shooterId,
        shot,
        players,
        rewindFn
      );

      for (const h of hits) {

        const target = players[h.id];
        if (!target) continue;

        const dmg = applyDamage(target, h.hitbox);

        console.log(
          `HIT ${h.id} (${h.hitbox}) - ${dmg} dmg`
        );
      }
    }
  };
}

module.exports = { createWeaponSystem };