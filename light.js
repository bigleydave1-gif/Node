const sun = new THREE.DirectionalLight(
0xffffff,
2
);

sun.position.set(
100,
200,
100
);

sun.castShadow = true;

scene.add(sun);

scene.add(
new THREE.AmbientLight(
0xffffff,
0.5
)
);