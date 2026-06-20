const ground = new THREE.Mesh(
new THREE.PlaneGeometry(200,200),
new THREE.MeshStandardMaterial({color:0xffffff})
);

ground.rotation.x = -Math.PI/2;

game.scene.add(ground);

createEnemy(5,1,-10);
createEnemy(-5,1,-15);
createEnemy(0,1,-25);