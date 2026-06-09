let yaw = 0;
let pitch = 0;

document.addEventListener("keydown", (e) => {
  Engine.keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
  Engine.keys[e.key.toLowerCase()] = false;
});

document.addEventListener("mousemove", (e) => {
  if (document.pointerLockElement !== document.body) return;

  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;

  pitch = Math.max(-1.4, Math.min(1.4, pitch));

  Engine.camera.rotation.order = "YXZ";
  Engine.camera.rotation.y = yaw;
  Engine.camera.rotation.x = pitch;
});

function updateControls(dt) {

  const E = Engine;
  const speed = 5 * dt;

  const forward = new THREE.Vector3(
    Math.sin(yaw),
    0,
    Math.cos(yaw)
  );

  const right = new THREE.Vector3(
    Math.sin(yaw + Math.PI / 2),
    0,
    Math.cos(yaw + Math.PI / 2)
  );

  if (E.keys["w"]) E.camera.position.addScaledVector(forward, -speed);
  if (E.keys["s"]) E.camera.position.addScaledVector(forward, speed);
  if (E.keys["a"]) E.camera.position.addScaledVector(right, -speed);
  if (E.keys["d"]) E.camera.position.addScaledVector(right, speed);
}