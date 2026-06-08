function startEngine() {

  log("✔ client.js loaded");

  if (typeof THREE === "undefined") {
    log("❌ THREE not loaded");
    return;
  }

  log("✔ THREE loaded");

  window.Engine = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000),
    renderer: new THREE.WebGLRenderer()
  };

  log("✔ Engine created");

  Engine.renderer.setSize(innerWidth, innerHeight);
  document.body.appendChild(Engine.renderer.domElement);

  log("✔ Renderer attached");

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  );

  Engine.scene.add(cube);
  Engine.camera.position.z = 3;

  log("✔ Cube added");

  function loop() {
    cube.rotation.y += 0.01;
    Engine.renderer.render(Engine.scene, Engine.camera);
    requestAnimationFrame(loop);
  }

  loop();

  log("✔ Loop running");
}

window.addEventListener("load", startEngine);