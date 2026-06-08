window.Engine = {
  scene: null,
  camera: null,
  renderer: null,
  clock: { last: performance.now() },
  objects: {}
};

function bootEngine() {
  const E = Engine;

  // Scene
  E.scene = new THREE.Scene();
  E.scene.background = new THREE.Color(0x111111);

  // Camera
  E.camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  E.camera.position.set(0, 2, 5);

  // Renderer
  E.renderer = new THREE.WebGLRenderer({ antialias: true });
  E.renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(E.renderer.domElement);

  // LIGHT
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  E.scene.add(light);

  // GROUND (proof world layer works)
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  ground.rotation.x = -Math.PI / 2;
  E.scene.add(ground);

  // TEST CUBE (engine version)
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  );
  cube.position.y = 1;
  E.scene.add(cube);

  E.objects.cube = cube;

  // resize
  window.addEventListener("resize", () => {
    E.camera.aspect = window.innerWidth / window.innerHeight;
    E.camera.updateProjectionMatrix();
    E.renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
}

function animate() {
  const E = Engine;
  requestAnimationFrame(animate);

  const now = performance.now();
  const dt = (now - E.clock.last) / 1000;
  E.clock.last = now;

  // rotation proof
  if (E.objects.cube) {
    E.objects.cube.rotation.y += dt * 1.5;
  }

  E.renderer.render(E.scene, E.camera);
}

window.addEventListener("load", bootEngine);