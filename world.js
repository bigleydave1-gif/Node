// =============================
// world.js (CLEAN ENGINE VERSION)
// =============================

function initWorld(Engine) {
  const scene = Engine.scene;

  if (!scene) {
    console.error("[WORLD] Engine.scene missing");
    return;
  }

  // -------------------------
  // WORLD LIGHTING
  // -------------------------
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  hemi.position.set(0, 50, 0);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 1.0);
  dir.position.set(10, 20, 10);
  scene.add(dir);

  // -------------------------
  // GROUND
  // -------------------------
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // -------------------------
  // SIMPLE MAP OBJECTS
  // -------------------------
  for (let i = 0; i < 30; i++) {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshStandardMaterial({ color: 0x555555 })
    );

    box.position.set(
      (Math.random() - 0.5) * 100,
      1,
      (Math.random() - 0.5) * 100
    );

    scene.add(box);
  }

  // -------------------------
  // INIT RUNTIME STORAGE
  // -------------------------
  Engine.world = {
    initialized: true
  };

  Engine.remotePlayers = {};
}

// =============================
// REMOTE PLAYER SYSTEM
// (CS-style interpolation)
// =============================
function updateRemotePlayers(Engine, dt) {
  const state = Engine.serverState;
  const scene = Engine.scene;

  if (!state || !state.players) return;

  if (!Engine.remotePlayers) {
    Engine.remotePlayers = {};
  }

  const seen = new Set();

  const lerp = 12 * dt; // frame-rate independent smoothing

  for (let id in state.players) {
    seen.add(id);

    const p = state.players[id];
    let obj = Engine.remotePlayers[id];

    // -------------------------
    // CREATE PLAYER MESH
    // -------------------------
    if (!obj) {
      obj = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.5, 1.2, 4, 8),
        new THREE.MeshStandardMaterial({ color: 0xff0000 })
      );

      obj.position.set(p.x, p.y, p.z);
      scene.add(obj);

      Engine.remotePlayers[id] = obj;
    }

    // -------------------------
    // SMOOTH INTERPOLATION
    // -------------------------
    obj.position.x += (p.x - obj.position.x) * lerp;
    obj.position.y += (p.y - obj.position.y) * lerp;
    obj.position.z += (p.z - obj.position.z) * lerp;
  }

  // -------------------------
  // CLEANUP DISCONNECTED PLAYERS
  // -------------------------
  for (let id in Engine.remotePlayers) {
    if (!seen.has(id)) {
      scene.remove(Engine.remotePlayers[id]);
      delete Engine.remotePlayers[id];
    }
  }
}