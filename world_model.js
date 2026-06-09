function loadWorld(Engine, GLTFLoader) {

  const loader = new GLTFLoader();

  loader.load("/maps/arena.glb", (gltf) => {

    const map = gltf.scene;
    Engine.scene.add(map);

    Engine.map = map;

    // VERY SIMPLE collision placeholder
    Engine.colliders = [];

    map.traverse((obj) => {
      if (obj.isMesh) {
        Engine.colliders.push(obj);
      }
    });

  });
}