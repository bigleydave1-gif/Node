function createPlayer(E) {

  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.5, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x00ff88 })
  );

  mesh.position.set(0, 1, 0);
  E.scene.add(mesh);

  E.player = {
    mesh,
    vel: new THREE.Vector3(),
    yaw: 0
  };
}