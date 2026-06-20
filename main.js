const ground = new THREE.Mesh(
new THREE.PlaneGeometry(200,200),
new THREE.MeshStandardMaterial({color:0xffffff})
);

ground.rotation.x = -Math.PI/2;
scene.add(ground);

// lighting
const light = new THREE.DirectionalLight(0xffffff,1);
light.position.set(10,20,10);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff,0.4));

// spawn enemies
createEnemy(5,1,-10);
createEnemy(-5,1,-15);
createEnemy(0,1,-25);

// loop
function animate(){

requestAnimationFrame(animate);

updatePlayer();

renderer.render(scene,camera);
}

animate();