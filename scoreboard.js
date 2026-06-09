const { getScoreboard } = require("./gamemode");

function startScoreboardSync(io) {

  setInterval(() => {

    io.emit("scoreboard", {
      scores: getScoreboard()
    });

  }, 1000);

}

module.exports = { startScoreboardSync };