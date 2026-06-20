let keys = {};
let speed = 0.15;

let velocityY = 0;
let gravity = 0.01;
let grounded = false;

window.addEventListener("keydown",e=>{
keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup",e=>{
keys[e.key.toLowerCase()] = false;
});

function updatePlayer(){

let forward = new THREE.Vector3();
game.camera.getWorldDirection(forward);
forward.y = 0;
forward.normalize();

let right = new THREE.Vector3();
right.crossVectors(forward,new THREE.Vector3(0,1,0));

// move
if(keys["w"]) game.camera.position.addScaledVector(forward,speed);
if(keys["s"]) game.camera.position.addScaledVector(forward,-speed);
if(keys["a"]) game.camera.position.addScaledVector(right,-speed);
if(keys["d"]) game.camera.position.addScaledVector(right,speed);

// gravity
velocityY -= gravity;
game.camera.position.y += velocityY;

// ground
if(game.camera.position.y < 2){
game.camera.position.y = 2;
velocityY = 0;
grounded = true;
}
}