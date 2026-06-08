function updateRemotePlayers() {

  if (!SERVER_STATE.players) return;

  for (let id in SERVER_STATE.players) {

    if (!remotePlayers[id]) {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, 1),
        new THREE.MeshStandardMaterial({ color: 0xff0000 })
      );
      scene.add(box);
      remotePlayers[id] = box;
    }

    const p = SERVER_STATE.players[id];
    const obj = remotePlayers[id];

    // 🔥 interpolation smoothing
    obj.position.x += (p.x - obj.position.x) * 0.2;
    obj.position.y += (p.y - obj.position.y) * 0.2;
    obj.position.z += (p.z - obj.position.z) * 0.2;
  }
}