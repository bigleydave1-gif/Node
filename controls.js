const keys = {};

let yaw = 0;
let pitch = 0;

let speed = 0.15;

let velocityY = 0;
let gravity = 0.01;
let isGrounded = false;

let canShoot = true;
let fireRate = 120;

// ENEMIES
const enemies = [];

// ======================
// INPUT
// ======================

window.addEventListener("keydown",(e)=>{
keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup",(e)=>{
keys[e.key.toLowerCase()] = false;
});

// POINTER LOCK (mouse look)
document.body.addEventListener("click",()=>{
document.body.requestPointerLock();
});

document.addEventListener("mousemove",(e)=>{

if(document.pointerLockElement !== document.body) return;

yaw -= e.movementX * 0.002;
pitch -= e.movementY * 0.002;

pitch = Math.max(-1.5,Math.min(1.5,pitch));

camera.rotation.order = "YXZ";
camera.rotation.y = yaw;
camera.rotation.x = pitch;
});

// ======================
// SHOOT
// ======================

window.addEventListener("mousedown",shoot);
window.addEventListener("touchstart",shoot);

function shoot(){

if(!canShoot) return;
canShoot = false;

const raycaster = new THREE.Raycaster();

raycaster.setFromCamera(new THREE.Vector2(0,0),camera);

const hits = raycaster.intersectObjects(scene.children,true);

for(let hit of hits){

const obj = hit.object;

// enemy hit detection
if(obj.parent && obj.parent.userData.enemy){

obj.parent.userData.health -= 25;

obj.parent.children[0].material.color.set(0xff0000);

// death
if(obj.parent.userData.health <= 0){
scene.remove(obj.parent);
enemies.splice(enemies.indexOf(obj.parent),1);
}

break;
}
}

setTimeout(()=>canShoot=true,fireRate);
}

// ======================
// PLAYER UPDATE
// ======================

function updatePlayer(){

// direction
let forward = new THREE.Vector3();
camera.getWorldDirection(forward);
forward.y = 0;
forward.normalize();

let right = new THREE.Vector3();
right.crossVectors(forward,new THREE.Vector3(0,1,0));

// movement
if(keys["w"]) camera.position.addScaledVector(forward,speed);
if(keys["s"]) camera.position.addScaledVector(forward,-speed);
if(keys["a"]) camera.position.addScaledVector(right,-speed);
if(keys["d"]) camera.position.addScaledVector(right,speed);

// jump
if(keys[" "] && isGrounded){
velocityY = 0.2;
isGrounded = false;
}

// gravity
velocityY -= gravity;
camera.position.y += velocityY;

// ground collision
if(camera.position.y < 2){
camera.position.y = 2;
velocityY = 0;
isGrounded = true;
}

// AI UPDATE
updateEnemies();
}

// ======================
// ENEMY AI
// ======================

function createEnemy(x,y,z){

const enemy = new THREE.Group();

const body = new THREE.Mesh(
new THREE.BoxGeometry(1,2,1),
new THREE.MeshStandardMaterial({color:0x00ff00})
);

enemy.add(body);

enemy.position.set(x,y,z);

enemy.userData = {
enemy:true,
health:100
};

scene.add(enemy);
enemies.push(enemy);

return enemy;
}

function updateEnemies(){

enemies.forEach(e=>{

// look at player
e.lookAt(camera.position);

// move toward player
let dir = new THREE.Vector3();
dir.subVectors(camera.position,e.position);
dir.y = 0;
dir.normalize();

e.position.addScaledVector(dir,0.02);

});

}