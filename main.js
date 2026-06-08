function startMain(player, camera, renderer, scene) {

  let keys = {};
  let yaw = 0;
  let pitch = 0;

  document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
  document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

  document.addEventListener("mousemove",(e)=>{

    if (document.pointerLockElement !== document.body) return;

    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;

    pitch = Math.max(-1.4,Math.min(1.4,pitch));

    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
  });

  function shoot() {
    const dir = new THREE.Vector3(0,0,-1);
    dir.applyQuaternion(camera.quaternion);

    if (Engine?.socket) {
      Engine.socket.emit("shoot", {
        x: player.position.x,
        y: player.position.y,
        z: player.position.z,
        dx: dir.x,
        dy: dir.y,
        dz: dir.z,
        t: Date.now()
      });
    }
  }

  document.addEventListener("click", shoot);
}