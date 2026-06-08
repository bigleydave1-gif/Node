function startEngine() {

  window.Engine = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000),
    renderer: new THREE.WebGLRenderer({ antialias:true }),
    net: {},
    remotePlayers: {}
  };

  Engine.renderer.setSize(innerWidth, innerHeight);
  document.body.appendChild(Engine.renderer.domElement);

  Engine.camera.position.set(0,2,5);

  initWorld(Engine);
  initNet(Engine);

  console.log("ENGINE READY");

  let last = performance.now();

  function loop() {

    const now = performance.now();
    const dt = (now - last) / 1000;
    last = now;

    if (Engine.updateRemotePlayers)
      Engine.updateRemotePlayers(Engine, dt);

    Engine.renderer.render(Engine.scene, Engine.camera);

    requestAnimationFrame(loop);
  }

  loop();

  if (window.startMain) {
    window.startMain(
      { position:{x:0,y:1.6,z:0} },
      Engine.camera,
      Engine.renderer,
      Engine.scene
    );
  }
}

window.addEventListener("load", startEngine);