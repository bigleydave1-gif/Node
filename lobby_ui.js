function initLobby(Engine) {

  const box = document.createElement("div");
  box.style.position = "absolute";
  box.style.bottom = "10px";
  box.style.right = "10px";
  box.style.color = "white";

  Engine.socket.on("room_update", (data) => {
    box.innerText =
      "Players: " + data.players.length +
      "\nState: " + data.state;
  });

  Engine.socket.on("match_start", (data) => {
    box.innerText = "MATCH START - Round " + data.round;
  });

  Engine.socket.on("match_end", () => {
    box.innerText = "MATCH ENDED";
  });

  document.body.appendChild(box);
}