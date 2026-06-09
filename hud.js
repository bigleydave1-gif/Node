function initHUD(Engine) {

  const hud = document.createElement("div");
  hud.style.position = "absolute";
  hud.style.top = "10px";
  hud.style.left = "10px";
  hud.style.color = "white";

  const hp = document.createElement("div");
  hp.innerText = "HP: 100";

  const crosshair = document.createElement("div");
  crosshair.innerText = "+";
  crosshair.style.position = "absolute";
  crosshair.style.top = "50%";
  crosshair.style.left = "50%";
  crosshair.style.transform = "translate(-50%, -50%)";
  crosshair.style.color = "white";

  hud.appendChild(hp);
  document.body.appendChild(hud);
  document.body.appendChild(crosshair);

  Engine.ui = { hp };
}