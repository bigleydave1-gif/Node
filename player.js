let recoil = 0;

function shoot() {

  recoil += 0.02;

  const dir = new THREE.Vector3(0, 0, -1);
  dir.applyQuaternion(camera.quaternion);

  // 🔥 recoil spread
  dir.x += (Math.random() - 0.5) * recoil;
  dir.y += (Math.random() - 0.5) * recoil;

  socket.emit("shoot", {
    x: player.position.x,
    y: player.position.y + 1.5,
    z: player.position.z,
    dx: dir.x,
    dy: dir.y,
    dz: dir.z
  });

  // 🎥 camera kick
  camera.rotation.x -= 0.015;

  setTimeout(() => recoil *= 0.6, 80);
}