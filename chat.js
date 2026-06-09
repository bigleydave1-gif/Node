function initChat(Engine) {

  const box = document.createElement("div");
  box.style.position = "absolute";
  box.style.bottom = "10px";
  box.style.left = "10px";
  box.style.width = "300px";

  const log = document.createElement("div");
  log.style.height = "150px";
  log.style.overflowY = "auto";
  log.style.color = "white";
  log.style.fontSize = "14px";

  const input = document.createElement("input");
  input.placeholder = "Chat...";
  input.style.width = "100%";

  input.onkeydown = (e) => {
    if (e.key === "Enter") {
      Engine.socket.emit("chat", {
        name: Engine.playerName,
        msg: input.value
      });
      input.value = "";
    }
  };

  Engine.socket.on("chat", (data) => {
    const line = document.createElement("div");
    line.innerText = `${data.name}: ${data.msg}`;
    log.appendChild(line);
  });

  box.appendChild(log);
  box.appendChild(input);
  document.body.appendChild(box);
}