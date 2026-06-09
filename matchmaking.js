const rooms = {};
const playerRoom = {};

function joinQueue(socket, io) {

  let room = null;

  // find open room
  for (const id in rooms) {
    if (rooms[id].players.length < 10) {
      room = rooms[id];
      break;
    }
  }

  // create room if none
  if (!room) {
    const id = "room_" + Math.random().toString(36).substr(2, 6);

    room = {
      id,
      players: [],
      state: "waiting",
      round: 0
    };

    rooms[id] = room;
  }

  room.players.push(socket.id);
  playerRoom[socket.id] = room.id;

  socket.join(room.id);

  io.to(room.id).emit("room_update", {
    players: room.players,
    state: room.state
  });

  // auto start
  if (room.players.length >= 2 && room.state === "waiting") {
    startMatch(io, room);
  }
}

function startMatch(io, room) {

  room.state = "playing";
  room.round = 1;

  io.to(room.id).emit("match_start", {
    round: room.round
  });

  startRoundLoop(io, room);
}

function startRoundLoop(io, room) {

  let timer = 90; // seconds per round

  const interval = setInterval(() => {

    timer--;

    io.to(room.id).emit("round_timer", { timer });

    if (timer <= 0) {

      room.round++;

      if (room.round > 12) {
        endMatch(io, room);
        clearInterval(interval);
        return;
      }

      timer = 90;

      io.to(room.id).emit("round_start", {
        round: room.round
      });
    }

  }, 1000);
}

function endMatch(io, room) {

  room.state = "ended";

  io.to(room.id).emit("match_end", {
    roomId: room.id
  });

  delete rooms[room.id];
}

module.exports = { joinQueue };