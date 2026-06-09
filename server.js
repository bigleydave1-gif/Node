// ================================
// V8 FPS SERVER (MATCHMAKING + ROUNDS + SCOREBOARD)
// ================================

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const { joinQueue } = require("./matchmaking");
const { initPlayer, addKill, getScoreboard } = require("./gamemode");
const { startScoreboardSync } = require("./scoreboard");
const { handleShot, bindServerState } = require("./hitreg");
const { history, saveHistory, getRewindPosition } = require("./rewind");

// ------------------ SETUP ------------------
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

const TICK_RATE = 64;
const TICK_MS = 1000 / TICK_RATE;

// ------------------ GAME STATE ------------------
const players = {};

// bind rewind system to hitreg
bindServerState(players, history);

// start scoreboard stream
startScoreboardSync(io);

// ------------------ SOCKET SYSTEM ------------------
io.on("connection", (socket) => {

  console.log("[CONNECT]", socket.id);

  // init player stats
  initPlayer(socket.id);

  players[socket.id] = {
    x: 0,
    y: 1,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    yaw: 0,
    hp: 100,
    team: Math.random() > 0.5 ? 1 : 2
  };

  // matchmaking
  joinQueue(socket, io);

  // ---------------- INPUT (movement prediction system) ----------------
  socket.on("input", (input) => {

    const p = players[socket.id];
    if (!p) return;

    const speed = 0.08;

    const forwardX = Math.sin(p.yaw);
    const forwardZ = Math.cos(p.yaw);

    const rightX = Math.sin(p.yaw + Math.PI / 2);
    const rightZ = Math.cos(p.yaw + Math.PI / 2);

    if (input.w) {
      p.x -= forwardX * speed;
      p.z -= forwardZ * speed;
    }
    if (input.s) {
      p.x += forwardX * speed;
      p.z += forwardZ * speed;
    }
    if (input.a) {
      p.x -= rightX * speed;
      p.z -= rightZ * speed;
    }
    if (input.d) {
      p.x += rightX * speed;
      p.z += rightZ * speed;
    }

    // gravity
    p.y += p.vy;
    p.vy -= 0.01;

    if (p.y < 1) {
      p.y = 1;
      p.vy = 0;
    }

    // save rewind history
    saveHistory(socket.id, p, Date.now());
  });

  // ---------------- SHOOTING (V6/V8 COMBAT SYSTEM) ----------------
  socket.on("shoot", (shot) => {

    handleShot(socket.id, shot, players, getRewindPosition);

  });

  // ---------------- KILL EVENT (score tracking) ----------------
  socket.on("kill", ({ killer, victim }) => {

    addKill(killer, victim);

    if (players[victim]) {
      players[victim].hp = 100;
      players[victim].x = 0;
      players[victim].y = 1;
      players[victim].z = 0;
    }
  });

  // ---------------- DISCONNECT ----------------
  socket.on("disconnect", () => {

    console.log("[DISCONNECT]", socket.id);

    delete players[socket.id];
  });

});

// ------------------ MAIN TICK LOOP ------------------
setInterval(() => {

  io.emit("state", {
    players,
    t: Date.now()
  });

}, TICK_MS);

// ------------------ START SERVER ------------------
const PORT = 3000;

server.listen(PORT, () => {
  console.log(`[SERVER] V8 FPS running on port ${PORT}`);
});