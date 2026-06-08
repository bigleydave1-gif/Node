function initNet(Engine) {

  const socket = io("http://localhost:3000");
  Engine.socket = socket;

  Engine.net = {
    inputSeq: 0,
    buffer: []
  };

  Engine.sendInput = function(input) {
    input.seq = Engine.net.inputSeq++;
    input.t = Date.now();
    socket.emit("input", input);
  };

  socket.on("snapshot", (state) => {
    Engine.serverState = state;

    Engine.net.buffer.push({
      t: Date.now(),
      state
    });

    if (Engine.net.buffer.length > 20)
      Engine.net.buffer.shift();
  });

  Engine.getBufferedState = function() {
    return Engine.net.buffer;
  };
}