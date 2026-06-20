const ground = new THREE.Mesh(

new THREE.PlaneGeometry(
5000,
5000
),

new THREE.MeshLambertMaterial({
color:0xffffff
})

);

ground.rotation.x=-Math.PI/2;

ground.receiveShadow=true;

scene.add(
ground
);

animate();