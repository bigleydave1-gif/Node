// =============================
// client.js (EDGEONE BOOT FILE)
// =============================

function startEngine() {

  // -------------------------
  // CREATE CORE ENGINE
  // -------------------------
  const Engine = window.Engine = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    ),
    renderer: new THREE.WebGLRenderer({ antialias: true }),

    keys: {},
    mouse: { x: 0, y: 0 },

    remotePlayers: {},
    serverState: null,
    net: null
  };

  // -------------------------
  // RENDERER SETUP
  // -------------------------
  Engine.renderer.setSize(window.innerWidth, window.innerHeight);
  Engine.renderer.setPixelRatio(window.devicePixelRatio || 1);

  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";
  document.body.appendChild(Engine.renderer.domElement);

  // -------------------------
  // CAMERA SETUP
  // -------------------------
  Engine.camera.position.set(0, 2, 5);

  // -------------------------
  // LOG BOOT
  // -------------------------
  console.log("[ENGINE] Ready");

  // -------------------------
  // LOAD SYSTEMS (ORDER MATTERS)
  // -------------------------
  if (typeof initWorld === "function") initWorld(Engine);
  if (typeof initNet === "function") initNet(Engine);
  if (typeof initSoldier === "function") initSoldier(Engine);

  // -------------------------
  // INPUT SYSTEM
  // -------------------------
  window.addEventListener("keydown", (e) => {
    Engine.keys[e.key.toLowerCase()] = true;
  });

  window.addEventListener("keyup", (e) => {
    Engine.keys[e.key.toLowerCase()] = false;
  });

  // -------------------------
  // RESIZE HANDLER
  // -------------------------
  window.addEventListener("resize", () => {
    Engine.camera.aspect = window.innerWidth / window.innerHeight;
    Engine.camera.updateProjectionMatrix();
    Engine.renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // -------------------------
  // SHOOT FUNCTION (CLIENT → SERVER)
  // -------------------------
  Engine.shoot = function (dir) {
    if (!Engine.socket) return;

    Engine.socket.emit("shoot", {
      x: Engine.camera.position.x,
      y: Engine.camera.position.y,
      z: Engine.camera.position.z,
      dir,
      t: Date.now()
    });
  };

  // -------------------------
  // MAIN LOOP (CRITICAL)
  // -------------------------
  let lastTime = performance.now();

  function loop() {

    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    // -------------------------
    // UPDATE REMOTE PLAYERS
    // -------------------------
    if (Engine.updateRemotePlayers) {
      Engine.updateRemotePlayers(Engine, dt);
    }

    // -------------------------
    // UPDATE SOLDIER
    // -------------------------
    if (typeof SoldierSystem !== "undefined" && SoldierSystem.update) {
      SoldierSystem.update(Engine, dt);
    }

    // -------------------------
    // RENDER FRAME
    // -------------------------
    Engine.renderer.render(Engine.scene, Engine.camera);

    requestAnimationFrame(loop);
  }

  loop();
}

// expose globally for EdgeOne
window.startEngine = startEngine;