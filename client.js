socket.emit("shoot", {
  x: player.position.x,
  y: player.position.y + 1.6,
  z: player.position.z,
  dir,
  t: Date.now() // IMPORTANT for rewind
});