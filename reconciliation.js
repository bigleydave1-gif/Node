function reconcile(E, serverState) {

  const p = E.player;
  if (!p) return;

  const serverPlayer = serverState.players[E.socket.id];
  if (!serverPlayer) return;

  const dx = serverPlayer.x - p.mesh.position.x;
  const dy = serverPlayer.y - p.mesh.position.y;
  const dz = serverPlayer.z - p.mesh.position.z;

  const error = Math.sqrt(dx*dx + dy*dy + dz*dz);

  // threshold (CS-style correction)
  if (error > 0.5) {

    // snap correction
    p.mesh.position.set(
      serverPlayer.x,
      serverPlayer.y,
      serverPlayer.z
    );

    p.vel.set(0, 0, 0);
  }

  // remove confirmed inputs
  E.pendingInputs = E.pendingInputs.filter(i => i.seq > serverState.lastProcessedSeq);
}