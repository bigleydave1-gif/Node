function initViewModel(Engine) {

  const gun = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 1),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
  );

  gun.position.set(0.3, -0.3, -0.6);

  Engine.camera.add(gun);
  Engine.scene.add(Engine.camera);

  Engine.viewmodel = gun;
}