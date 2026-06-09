window.Engine = {
  scene: null,
  camera: null,
  renderer: null,

  clock: new THREE.Clock(),

  socket: null,

  player: null,

  keys: {},

  inputSeq: 0,

  pendingInputs: [],   // 👈 prediction queue

  serverState: null,

  remote: {},

  renderBuffer: []      // 👈 interpolation buffer
};