function animate(){

requestAnimationFrame(animate);

updatePlayer();
updateEnemies();

game.renderer.render(game.scene,game.camera);
}

animate();