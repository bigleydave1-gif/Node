const socket = io("http://localhost:3000");

// buffers
let inputSeq = 0;
let serverState = {};
let stateBuffer = [];

// send INPUT (not position — IMPORTANT)
export function sendInput(input) {
  input.seq = inputSeq++;
  input.t = Date.now();
  socket.emit("input", input);
}

// snapshots (interpolation base)
socket.on("snapshot", (state) => {
  stateBuffer.push(state);
  if (stateBuffer.length > 20) stateBuffer.shift();
});

export function getBufferedState() {
  return stateBuffer;
}