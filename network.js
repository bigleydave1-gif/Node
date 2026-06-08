const socket = io("http://localhost:3000");

let SERVER_STATE = {};
let LAST_STATE = {};
let INTERP = {};

socket.on("snapshot", (data) => {
  LAST_STATE = SERVER_STATE;
  SERVER_STATE = data;
  INTERP = { t: 0 };
});