const scores = {};

function initPlayer(socketId) {
  scores[socketId] = {
    kills: 0,
    deaths: 0,
    team: socketId.charCodeAt(0) % 2
  };
}

function addKill(killer, victim) {
  if (scores[killer]) scores[killer].kills++;
  if (scores[victim]) scores[victim].deaths++;
}

function getScoreboard() {
  return scores;
}

module.exports = {
  initPlayer,
  addKill,
  getScoreboard
};