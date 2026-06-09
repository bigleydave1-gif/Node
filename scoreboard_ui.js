function initScoreboard(Engine) {

  const box = document.createElement("div");
  box.style.position = "absolute";
  box.style.top = "10px";
  box.style.right = "10px";
  box.style.color = "white";
  box.style.fontSize = "14px";

  Engine.socket.on("scoreboard", (data) => {

    box.innerHTML = "<b>Scoreboard</b><br>";

    for (const id in data.scores) {

      const p = data.scores[id];

      box.innerHTML += `
        ${id.slice(0,5)} |
        K:${p.kills} D:${p.deaths}<br>
      `;
    }
  });

  document.body.appendChild(box);
}