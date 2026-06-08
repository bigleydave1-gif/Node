// =============================
// net.js (EdgeOne compatible)
// CS2-style networking core
// =============================

function initNet(Engine) {
  // -------------------------
  // SOCKET CONNECTION
  // -------------------------
  const socket = io("http://localhost:3000");
  Engine.socket = socket;

  // -------------------------
  // NET STATE (single source)
  // -------------------------
  Engine.net = {
    inputSeq: 0,
    stateBuffer: [],
    lastSnapshotTime: 0
  };

  // =========================
  // SEND INPUT TO SERVER
  // (DO NOT send position)
  // =========================
  Engine.sendInput = function (input) {
    if (!socket || socket.disconnected) return;

    input.seq = Engine.net.inputSeq++;
    input.t = performance.now();

    socket.emit("input", input);
  };

  // =========================
  // SERVER SNAPSHOT RECEIVE
  // =========================
  socket.on("snapshot", (state) => {
    // SINGLE SOURCE OF TRUTH
    Engine.serverState = state;
    Engine.net.lastSnapshotTime = performance.now();

    // BUFFER FOR INTERPOLATION
    const buf = Engine.net.stateBuffer;

    buf.push({
      time: performance.now(),
      state: state
    });

    // keep buffer small (prevents memory + lag)
    if (buf.length > 20) buf.shift();
  });

  // =========================
  // INTERPOLATION HELPER
  // (used by world / remote players)
  // =========================
  Engine.getInterpolatedState = function (renderTimeOffset = 100) {
    const buf = Engine.net.stateBuffer;
    if (buf.length < 2) return Engine.serverState;

    const renderTime = performance.now() - renderTimeOffset;

    let i1 = null;
    let i2 = null;

    for (let i = 0; i < buf.length - 1; i++) {
      if (buf[i].time <= renderTime && buf[i + 1].time >= renderTime) {
        i1 = buf[i];
        i2 = buf[i + 1];
        break;
      }
    }

    if (!i1 || !i2) return Engine.serverState;

    return i1.state; // simplified safe fallback (stable baseline)
  };

  // =========================
  // GET BUFFER (debug/tools)
  // =========================
  Engine.getBufferedState = function () {
    return Engine.net.stateBuffer;
  };

  // =========================
  // DISCONNECT HANDLING
  // =========================
  socket.on("disconnect", () => {
    console.warn("[NET] Disconnected from server");
  });

  socket.on("connect", () => {
    console.log("[NET] Connected:", socket.id);
  });
}