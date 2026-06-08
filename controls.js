let yaw = 0;
let pitch = 0;

let velocityY = 0;
let headBob = 0;

const sensitivity = 0.0025;

document.addEventListener("mousemove", (e) => {
  if (document.pointerLockElement !== document.body) return;

  yaw -= e.movementX * sensitivity;
  pitch -= e.movementY * sensitivity;

  pitch = Math.max(-1.4, Math.min(1.4, pitch));
});

function updateControls() {

  const speed = 0.08;

  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const right = new THREE.Vector3(Math.sin(yaw + Math.PI / 2), 0, Math.cos(yaw + Math.PI / 2));

  if (keys["w"]) player.position.addScaledVector(forward, -speed);
  if (keys["s"]) player.position.addScaledVector(forward, speed);
  if (keys["a"]) player.position.addScaledVector(right, -speed);
  if (keys["d"]) player.position.addScaledVector(right, speed);

  // 🎥 head bob (AAA polish)
  headBob += 0.12;
  let bob = Math.sin(headBob) * 0.02;

  camera.position.y = 1.7 + bob;

  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  socket.emit("update", {
    x: player.position.x,
    y: player.position.y,
    z: player.position.z,
    yaw
  });
}