const enemies = [];

function createEnemy(x,y,z){

const e = new THREE.Mesh(
new THREE.BoxGeometry(1,2,1),
new THREE.MeshStandardMaterial({color:0x00ff00})
);

e.position.set(x,y,z);
e.health = 100;

game.scene.add(e);
enemies.push(e);

return e;
}

function updateEnemies(){

enemies.forEach(e=>{

// move toward player
let dir = new THREE.Vector3();
dir.subVectors(game.camera.position,e.position);
dir.y = 0;
dir.normalize();

e.position.addScaledVector(dir,0.02);

e.lookAt(game.camera.position);

});
}