// =============================
// MAIN ENTRY (V7 FPS ENGINE)
// =============================

window.addEventListener("load", async () => {

  const E = Engine;

  console.log("[ENGINE] Booting V7 FPS Game Layer...");

  // -----------------------------
  // CORE WORLD INIT (Three.js)
  // -----------------------------
  initWorld(E);

  // -----------------------------
  // NETWORK
  // -----------------------------
  initNet(E);

  // -----------------------------
  // PLAYER
  // -----------------------------
  createPlayer(E);

  // -----------------------------
  // UI SYSTEMS (V7 LAYER)
  // -----------------------------
  initMenu(E);
  initHUD(E);
  initChat(E);
  initViewModel(E);

  // -----------------------------
  // LOADERS (GLB SUPPORT)
  // -----------------------------
  if (typeof GLTFLoader !== "undefined") {
    await loadPlayerModel(E, GLTFLoader);
    loadWorld(E, GLTFLoader);
  } else {
    console.warn("[ENGINE] GLTFLoader missing — skipping models");
  }

  // -----------------------------
  // INPUT SYSTEM
  // -----------------------------
  document.addEventListener("keydown", (e) => {
    E.keys[e.key.toLowerCase()] = true;
  });

  document.addEventListener("keyup", (e) => {
    E.keys[e.key.toLowerCase()] = false;
  });

  // pointer lock for FPS camera
  document.body.addEventListener("click", () => {
    document.body.requestPointerLock();
  });

  // -----------------------------
  // SHOOT INPUT (LEFT CLICK)
  // -----------------------------
  document.addEventListener("mousedown", (e) => {

    if (e.button !== 0) return;

    if (!E.player) return;

    // simple shot packet (server authoritative in V6/V7)
    E.socket.emit("shoot", {
      x: E.camera.position.x,
      y: E.camera.position.y,
      z: E.camera.position.z,

      dx: Math.sin(E.camera.rotation.y),
      dy: Math.sin(E.camera.rotation.x),
      dz: Math.cos(E.camera.rotation.y),

      weapon: "AK47",
      t: Date.now(),
      index: E.inputSeq || 0
    });
  });

  // -----------------------------
  // MAIN GAME LOOP
  // -----------------------------
  function animate() {

    requestAnimationFrame(animate);

    const dt = E.clock.getDelta();

    // -----------------------------
    // PLAYER MOVEMENT (V6 physics)
    // -----------------------------
    if (typeof movePlayer === "function") {
      movePlayer(E, dt);
    }

    // -----------------------------
    // WEAPON ANIMATION UPDATE
    // -----------------------------
    if (E.anim && E.anim.mixer) {
      E.anim.mixer.update(dt);
    }

    // -----------------------------
    // REMOTE PLAYER INTERPOLATION (if exists)
    // -----------------------------
    if (typeof interpolateRemote === "function") {
      interpolateRemote(E);
    }

    // -----------------------------
    // RENDER
    // -----------------------------
    E.renderer.render(E.scene, E.camera);
  }

  animate();

  console.log("[ENGINE] V7 Fully Running");
});