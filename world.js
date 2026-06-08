function initWorld(Engine) {

  const scene = Engine.scene;

  const light = new THREE.HemisphereLight(0xffffff,0x444444,1.2);
  scene.add(light);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200,200),
    new THREE.MeshStandardMaterial({ color:0x222222 })
  );

  ground.rotation.x = -Math.PI/2;
  scene.add(ground);

  Engine.updateRemotePlayers = function(Engine, dt) {

    const state = Engine.serverState;
    if (!state || !state.players) return;

    const seen = new Set();

    for (let id in state.players) {

      seen.add(id);

      const p = state.players[id];

      if (!Engine.remotePlayers[id]) {
        const mesh = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.5,1.2),
          new THREE.MeshStandardMaterial({ color:0xff4444 })
        );

        Engine.scene.add(mesh);
        Engine.remotePlayers[id] = mesh;
      }

      const obj = Engine.remotePlayers[id];

      obj.position.x += (p.x - obj.position.x) * 0.2;
      obj.position.y += (p.y - obj.position.y) * 0.2;
      obj.position.z += (p.z - obj.position.z) * 0.2;
    }

    for (let id in Engine.remotePlayers) {
      if (!seen.has(id)) {
        Engine.scene.remove(Engine.remotePlayers[id]);
        delete Engine.remotePlayers[id];
      }
    }
  };
}