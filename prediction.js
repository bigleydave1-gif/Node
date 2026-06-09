function predict(E, input) {

  const p = E.player;
  if (!p) return;

  const speed = 6;

  const forward = new THREE.Vector3(
    Math.sin(p.yaw),
    0,
    Math.cos(p.yaw)
  );

  const right = new THREE.Vector3(
    Math.sin(p.yaw + Math.PI / 2),
    0,
    Math.cos(p.yaw + Math.PI / 2)
  );

  if (input.w) p.vel.addScaledVector(forward, -speed);
  if (input.s) p.vel.addScaledVector(forward, speed);
  if (input.a) p.vel.addScaledVector(right, -speed);
  if (input.d) p.vel.addScaledVector(right, speed);

  p.mesh.position.addScaledVector(p.vel, input.dt);
}