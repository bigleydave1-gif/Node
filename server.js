const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

let players = {};
let boss = {
  hp: 100,
  x: 0,
  y: 20,
  z: -50
};

function broadcast(data){
  const msg = JSON.stringify(data);
  wss.clients.forEach(c=>{
    if(c.readyState === 1) c.send(msg);
  });
}

wss.on("connection",(ws)=>{

  let id = Math.random().toString(36).substring(2,9);

  players[id] = {
    x:0,y:3,z:10,
    yaw:0
  };

  ws.send(JSON.stringify({type:"init", id, boss, players}));

  ws.on("message",(msg)=>{
    const data = JSON.parse(msg);

    if(data.type==="move"){
      players[id] = data.state;
    }

    if(data.type==="hitBoss"){
      boss.hp -= 2;
    }

    broadcast({
      type:"state",
      players,
      boss
    });
  });

  ws.on("close",()=>{
    delete players[id];
  });

});