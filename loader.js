function loadPlayerModel(Engine, GLTFLoader) {

  const loader = new GLTFLoader();

  return new Promise((resolve) => {

    loader.load("/models/soldier.glb", (gltf) => {

      const model = gltf.scene;
      model.scale.set(1,1,1);

      Engine.scene.add(model);

      const mixer = new THREE.AnimationMixer(model);

      const actions = {};

      gltf.animations.forEach((clip) => {
        actions[clip.name] = mixer.clipAction(clip);
      });

      Engine.anim = { mixer, actions, model };

      resolve(model);
    });
  });
}