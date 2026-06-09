function animate() {

  const E = Engine;
  requestAnimationFrame(animate);

  const dt = E.clock.getDelta();

  const input = {
    seq: E.inputSeq++,
    dt,
    w: E.keys["w"],
    a: E.keys["a"],
    s: E.keys["s"],
    d: E.keys["d"]
  };

  E.pendingInputs.push(input);

  predict(E, input);
  E.sendInput(input);

  interpolateRemote(E);

  E.renderer.render(E.scene, E.camera);
}

window.addEventListener("load", () => {

  const E = Engine;

  initWorld(E);
  createPlayer(E);
  initNet(E);

  document.addEventListener("keydown", e => E.keys[e.key.toLowerCase()] = true);
  document.addEventListener("keyup", e => E.keys[e.key.toLowerCase()] = false);

  animate();
});