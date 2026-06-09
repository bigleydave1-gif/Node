function simulatePlayer(p, input) {

  const speed = 0.08;

  const forwardX = Math.sin(p.yaw);
  const forwardZ = Math.cos(p.yaw);

  const rightX = Math.sin(p.yaw + Math.PI / 2);
  const rightZ = Math.cos(p.yaw + Math.PI / 2);

  if (input.w) {
    p.x -= forwardX * speed;
    p.z -= forwardZ * speed;
  }
  if (input.s) {
    p.x += forwardX * speed;
    p.z += forwardZ * speed;
  }
  if (input.a) {
    p.x -= rightX * speed;
    p.z -= rightZ * speed;
  }
  if (input.d) {
    p.x += rightX * speed;
    p.z += rightZ * speed;
  }

  // gravity
  p.vy -= 0.01;
  p.y += p.vy;

  if (p.y < 1) {
    p.y = 1;
    p.vy = 0;
  }
}