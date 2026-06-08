export function movePlayer(player, input, colliders) {

  const speed = 0.09;

  const forward = new THREE.Vector3(Math.sin(input.yaw), 0, Math.cos(input.yaw));
  const right = new THREE.Vector3(Math.sin(input.yaw + Math.PI / 2), 0, Math.cos(input.yaw + Math.PI / 2));

  let next = player.position.clone();

  if (input.w) next.addScaledVector(forward, -speed);
  if (input.s) next.addScaledVector(forward, speed);
  if (input.a) next.addScaledVector(right, -speed);
  if (input.d) next.addScaledVector(right, speed);

  // capsule collision approximation (ray-based)
  for (let c of colliders) {
    const box = new THREE.Box3().setFromObject(c);

    if (box.containsPoint(next)) {
      return player.position; // blocked
    }
  }

  return next;
}