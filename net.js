function initNet(E) {

  const socket = io("http://localhost:3000");
  E.socket = socket;

  socket.on("state", (state) => {
    E.serverState = state;

    // push for interpolation
    E.renderBuffer.push({
      t: Date.now(),
      state
    });

    if (E.renderBuffer.length > 30)
      E.renderBuffer.shift();

    reconcile(E, state);
  });

  E.sendInput = function(input) {
    socket.emit("input", input);
  };
}