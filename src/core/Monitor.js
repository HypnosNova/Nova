class Monitor {
  constructor(world, option) {
    this.option = option;
    this.fullWidth = world.app.getWorldWidth();
    this.fullHeight = world.app.getWorldHeight();
    this.renderer = new THREE.WebGLRenderer();
    this.world = world;
    this.canvas = this.renderer.domElement;
    this.renderer.setSize(this.fullWidth * option.width, this.fullHeight *
      option.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  setViewOffset() {
    let viewX = this.fullWidth * this.option.left;
    let viewY = this.fullHeight * this.option.top;
    let viewWidth = this.fullWidth * this.option.width;
    let viewHeight = this.fullHeight * this.option.height;
    this.world.camera.setViewOffset(this.fullWidth, this.fullHeight, viewX,
      viewY, viewWidth, viewHeight);
  }

  render() {
    this.setViewOffset();
    this.renderer.render(this.world.scene, this.world.camera);
  }
}

export {
  Monitor
};