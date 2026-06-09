function interpolateRemote(E) {

  const buffer = E.renderBuffer;
  if (buffer.length < 2) return;

  const renderTime = Date.now() - 100;

  let older = buffer[0];
  let newer = buffer[1];

  for (let i = 0; i < buffer.length - 1; i++) {
    if (buffer[i].t <= renderTime && buffer[i + 1].t >= renderTime) {
      older = buffer[i];
      newer = buffer[i + 1];
      break;
    }
  }

  const t =
    (renderTime - older.t) /
    (newer.t - older.t);

  for (const id in newer.state.players) {

    const a = older.state.players[id];
    const b = newer.state.players[id];

    if (!a || !b) continue;

    if (!E.remote[id]) {
      const mesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.5, 1.2),
        new THREE.MeshStandardMaterial({ color: 0xff4444 })
      );
      E.scene.add(mesh);
      E.remote[id] = mesh;
    }

    const obj = E.remote[id];

    obj.position.x = THREE.MathUtils.lerp(a.x, b.x, t);
    obj.position.y = THREE.MathUtils.lerp(a.y, b.y, t);
    obj.position.z = THREE.MathUtils.lerp(a.z, b.z, t);
  }
}