import { sendInput, getBufferedState } from "./net.js";
import { movePlayer } from "./physics.js";

/* =========================
   🎮 ENGINE STATE
========================= */

let player;
let camera;

let keys = {};

let yaw = 0;
let pitch = 0;

/* recoil system (CS-style pattern control) */
let recoil = 0;
let recoilRecovery = 0;

/* animation state machine */
let animState = "idle"; // idle | run | shoot

/* remote players */
let remote = {};

/* interpolation buffer */
let renderDelay = 100;

/* =========================
   🎯 INPUT SYSTEM
========================= */

document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

/* pointer lock */
document.addEventListener("click", () => {
  document.body.requestPointerLock();
});

/* mouse look */
document.addEventListener("mousemove", (e) => {
  if (document.pointerLockElement !== document.body) return;

  yaw -= e.movementX * 0.0022;
  pitch -= e.movementY * 0.0022;

  pitch = Math.max(-1.4, Math.min(1.4, pitch));

  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
});

/* =========================
   🔫 SHOOTING (CS STYLE)
========================= */

function shoot() {

  animState = "shoot";

  recoil += 0.018;

  const dir = new THREE.Vector3(0, 0, -1);
  dir.applyQuaternion(camera.quaternion);

  // CS-style recoil spread (pattern-based decay)
  dir.x += (Math.random() - 0.5) * recoil;
  dir.y += (Math.random() - 0.5) * recoil;

  sendInput({
    type: "shoot",
    x: player.position.x,
    y: player.position.y + 1.6,
    z: player.position.z,
    dx: dir.x,
    dy: dir.y,
    dz: dir.z,
    t: Date.now()
  });

  camera.rotation.x -= 0.015;

  setTimeout(() => {
    recoil *= 0.6;
    animState = "idle";
  }, 90);
}

/* =========================
   🧍 MOVEMENT (CAPSULE FEEL)
========================= */

function updateMovement() {

  let speed = 0.085;

  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const right = new THREE.Vector3(Math.sin(yaw + Math.PI / 2), 0, Math.cos(yaw + Math.PI / 2));

  let input = {
    w: keys["w"],
    a: keys["a"],
    s: keys["s"],
    d: keys["d"],
    yaw
  };

  // prediction movement (client-side)
  player.position = movePlayer(player, input, window.colliders || []);

  // animation state detection
  if (keys["w"] || keys["a"] || keys["s"] || keys["d"]) {
    animState = "run";
  } else if (animState !== "shoot") {
    animState = "idle";
  }

  sendInput(input);
}

/* =========================
   🌐 REMOTE PLAYER INTERPOLATION
========================= */

function updateRemotePlayers() {

  const states = getBufferedState();

  const renderTime = Date.now() - renderDelay;

  const frame = states.find(s =>
    Math.abs(s.t - renderTime) < 50
  );

  if (!frame) return;

  for (let id in frame.players) {

    if (!remote[id]) {
      const mesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.5, 1.2, 4, 8),
        new THREE.MeshStandardMaterial({ color: 0xff4444 })
      );

      scene.add(mesh);
      remote[id] = mesh;
    }

    const p = frame.players[id];
    const obj = remote[id];

    obj.position.lerp(
      new THREE.Vector3(p.x, p.y, p.z),
      0.22
    );
  }
}

/* =========================
   🎥 CAMERA POLISH (ENGINE FEEL)
========================= */

function updateCameraEffects() {

  let bob = 0;

  if (animState === "run") {
    bob = Math.sin(Date.now() * 0.02) * 0.05;
  }

  camera.position.y = 1.7 + bob;

  // recoil camera smoothing
  camera.rotation.x -= recoil * 0.02;
  recoil *= 0.95;
}

/* =========================
   🎮 MAIN LOOP
========================= */

function animate() {

  requestAnimationFrame(animate);

  if (player) {
    updateMovement();
    updateCameraEffects();
  }

  updateRemotePlayers();

  renderer.render(scene, camera);
}

/* =========================
   🚀 INIT HOOK
========================= */

export function startEngine(world, cam, ply, render, sceneRef) {

  camera = cam;
  player = ply;
  renderer = render;
  scene = sceneRef;

  animate();
}

/* =========================
   🔫 GLOBAL SHOOT HOOK
========================= */

window.addEventListener("click", shoot);