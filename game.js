console.log("GAME START");

// =====================
// CORE ENGINE
// =====================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
1000
);

camera.position.set(0,2,5);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

// LIGHT
scene.add(new THREE.AmbientLight(0xffffff,0.4));

const sun = new THREE.DirectionalLight(0xffffff,1);
sun.position.set(10,20,10);
scene.add(sun);

// GROUND
const ground = new THREE.Mesh(
new THREE.PlaneGeometry(200,200),
new THREE.MeshStandardMaterial({color:0xffffff})
);

ground.rotation.x = -Math.PI/2;
scene.add(ground);

// =====================
// PLAYER
// =====================

let keys = {};
let velocityY = 0;
let gravity = 0.01;
let grounded = false;
let speed = 0.15;

window.addEventListener("keydown",e=>keys[e.key.toLowerCase()]=true);
window.addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);

// =====================
// ENEMIES
// =====================

const enemies = [];

function spawnEnemy(x,y,z){

const e = new THREE.Mesh(
new THREE.BoxGeometry(1,2,1),
new THREE.MeshStandardMaterial({color:0x00ff00})
);

e.position.set(x,y,z);
e.health = 100;

scene.add(e);
enemies.push(e);
}

spawnEnemy(5,1,-10);
spawnEnemy(-5,1,-15);
spawnEnemy(0,1,-25);

// =====================
// UPDATE
// =====================

function updatePlayer(){

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

// gravity
velocityY -= gravity;
camera.position.y += velocityY;

if(camera.position.y < 2){
camera.position.y = 2;
velocityY = 0;
grounded = true;
}
}

function updateEnemies(){

enemies.forEach(e=>{

let dir = new THREE.Vector3();
dir.subVectors(camera.position,e.position);
dir.y = 0;
dir.normalize();

e.position.addScaledVector(dir,0.02);
e.lookAt(camera.position);

});
}

// =====================
// LOOP
// =====================

function animate(){
requestAnimationFrame(animate);

updatePlayer();
updateEnemies();

renderer.render(scene,camera);
}

animate();

console.log("RUNNING");