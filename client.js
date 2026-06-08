// =============================
// client.js - RENDER TEST ONLY
// =============================

function startEngine() {

  console.log("[ENGINE] Boot starting...");

  // -------------------------
  // CORE ENGINE
  // -------------------------
  window.Engine = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    ),
    renderer: new THREE.WebGLRenderer({ antialias: true }),

    remotePlayers: {},
    net: {}
  };

  Engine.renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(Engine.renderer.domElement);

  Engine.camera.position.set(0, 2, 5);

  // -------------------------
  // BASIC TEST OBJECT
  // -------------------------
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  );

  Engine.scene.add(cube);

  // -------------------------
  // SIMPLE LOOP
  // -------------------------
  function loop() {
    cube.rotation.y += 0.01;

    Engine.renderer.render(Engine.scene, Engine.camera);

    requestAnimationFrame(loop);
  }

  loop();

  console.log("[ENGINE] Running (green cube should appear)");
}

// auto-start
window.addEventListener("load", startEngine);