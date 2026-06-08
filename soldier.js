window.SoldierSystem = (function () {

  let scene;
  let loader;
  let mixer;
  let model;

  let actions = {};
  let currentAction = null;

  function load(GLTFLoader, targetScene, url) {

    scene = targetScene;
    loader = new GLTFLoader();

    return new Promise((resolve, reject) => {

      loader.load(url, (gltf) => {

        model = gltf.scene;
        scene.add(model);

        model.scale.set(1, 1, 1);
        model.position.set(0, 0, 0);

        // animation setup
        mixer = new THREE.AnimationMixer(model);

        if (gltf.animations && gltf.animations.length) {

          gltf.animations.forEach((clip) => {
            actions[clip.name] = mixer.clipAction(clip);
          });

          // fallback: play first animation
          const first = Object.values(actions)[0];
          if (first) {
            currentAction = first;
            currentAction.play();
          }
        }

        resolve(model);

      }, undefined, reject);

    });
  }

  function setState(state) {

    if (!actions) return;

    if (state === "run" && actions["Run"]) {
      switchTo(actions["Run"]);
    }

    if (state === "idle" && actions["Idle"]) {
      switchTo(actions["Idle"]);
    }

    if (state === "shoot" && actions["Shoot"]) {
      switchTo(actions["Shoot"]);
    }
  }

  function switchTo(action) {
    if (currentAction === action) return;

    if (currentAction) currentAction.fadeOut(0.2);

    currentAction = action;
    currentAction.reset().fadeIn(0.2).play();
  }

  function update(dt, position, rotationY) {

    if (!model) return;

    // follow player (for local or remote reuse)
    model.position.set(position.x, position.y, position.z);
    model.rotation.y = rotationY;

    if (mixer) mixer.update(dt);
  }

  function getModel() {
    return model;
  }

  return {
    load,
    update,
    setState,
    getModel
  };

})();