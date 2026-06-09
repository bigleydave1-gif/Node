function initMenu(Engine) {

  const menu = document.createElement("div");
  menu.style.position = "absolute";
  menu.style.top = "0";
  menu.style.left = "0";
  menu.style.width = "100%";
  menu.style.height = "100%";
  menu.style.background = "#111";
  menu.style.display = "flex";
  menu.style.flexDirection = "column";
  menu.style.justifyContent = "center";
  menu.style.alignItems = "center";
  menu.style.color = "white";

  const input = document.createElement("input");
  input.placeholder = "Enter Name";
  input.style.fontSize = "20px";

  const btn = document.createElement("button");
  btn.innerText = "Join Game";
  btn.style.marginTop = "10px";

  btn.onclick = () => {
    Engine.playerName = input.value || "Player";
    menu.remove();

    Engine.socket.emit("join", {
      name: Engine.playerName
    });
  };

  menu.appendChild(input);
  menu.appendChild(btn);
  document.body.appendChild(menu);
}