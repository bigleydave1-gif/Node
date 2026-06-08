function startMain(player, camera, renderer, scene) {

  console.log("[MAIN] START");

  try {

    const keys = {};
    let yaw = 0;
    let pitch = 0;

    document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
    document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

    document.addEventListener("mousemove", (e) => {
      if (document.pointerLockElement !== document.body) return;

      yaw -= e.movementX * 0.0022;
      pitch -= e.movementY * 0.0022;

      pitch = Math.max(-1.4, Math.min(1.4, pitch));

      camera.rotation.order = "YXZ";
      camera.rotation.y = yaw;
      camera.rotation.x = pitch;
    });

    function loop() {

      try {

        requestAnimationFrame(loop);

        // HARD SAFETY CHECKS
        if (!renderer || !scene || !camera) {
          console.error("[MAIN] Missing core engine refs");
          return;
        }

        renderer.render(scene, camera);

      } catch (err) {
        console.error("[MAIN LOOP ERROR]", err);
      }
    }

    loop();

    console.log("[MAIN] LOOP STARTED");

  } catch (err) {
    console.error("[MAIN CRASH]", err);
  }
}

window.startMain = startMain;