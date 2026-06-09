const HITBOXES = {
  head: { r: 0.35, y: 1.65, dmg: 4.0 },
  chest: { r: 0.6,  y: 1.2,  dmg: 1.0 },
  legs: { r: 0.6,  y: 0.6,  dmg: 0.75 }
};

// returns which body part was hit
function getHitbox(hitPos, target) {

  const dx = hitPos.x - target.x;
  const dz = hitPos.z - target.z;

  const dist = Math.sqrt(dx * dx + dz * dz);

  // head
  if (Math.abs(hitPos.y - HITBOXES.head.y - target.y) < 0.25 && dist < HITBOXES.head.r) {
    return "head";
  }

  // chest
  if (Math.abs(hitPos.y - HITBOXES.chest.y - target.y) < 0.5 && dist < HITBOXES.chest.r) {
    return "chest";
  }

  // legs fallback
  return "legs";
}

module.exports = { HITBOXES, getHitbox };