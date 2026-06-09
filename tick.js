const { simulateBullets } = require("./bullets");

const TICK_RATE = 64;
const DT = 1000 / TICK_RATE;

function startTick(io, state) {

  setInterval(() => {

    const dt = DT / 1000;

    simulateBullets(dt);

    io.emit("state", {
      players: state.players,
      bullets: state.bullets,
      t: Date.now()
    });

  }, DT);
}

module.exports = { startTick };