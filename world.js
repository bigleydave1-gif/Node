function initWorld(E) {

  E.scene = new THREE.Scene();

  E.camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  E.camera.position.set(0, 2, 5);

  E.renderer = new THREE.WebGLRenderer({ antialias: true });
  E.renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(E.renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1.2);
  light.position.set(5, 10, 5);
  E.scene.add(light);

  const ambient = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  E.scene.add(ambient);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
  );

  ground.rotation.x = -Math.PI / 2;
  E.scene.add(ground);
}