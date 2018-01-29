class EffectFactory {
  constructor(app) {
    this.app = app;
    this.canvas = this.app.renderer.domElement;
    this.vrEffect;
  }

  openVREffect() {
    if (!this.vrEffect) {
      this.vrEffect = new THREE.VREffect(this.app.renderer);
      this.vrEffect.setSize(this.canvas.clientWidth, this.canvas.clientHeight,
        false);
      this.vrEffect.isOpened = false;
      this.vrEffect.updateId = Symbol();
    }
    if (this.vrEffect.isOpened) {
      return;
    }
    this.vrEffect.isOpened = true;
    this.app.renderLoop.add(() => {
      this.vrEffect.render(this.app.world.scene, this.app.world.camera);
    }, this.vrEffect.updateId);
  }
}

export {
  EffectFactory
};