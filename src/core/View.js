import { LoopManager } from './LoopManager.js';
import { EventManager } from './../events/EventManager';

class View {
  constructor(world, camera, {
    clearColor = 0x000000,
    top = 0,
    left = 0,
    width = 1,
    height = 1
  }) {
    this.world = world;
    this.scene = world.scene;
    this.worldWidth = world.app.getWorldWidth();
    this.worldHeight = world.app.getWorldHeight();
    this.renderer = world.app.renderer;
    this.camera = camera || new THREE.PerspectiveCamera(45, this.worldWidth /
      this.worldHeight, 0.01, 1000);
    this.renderTargetParameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat,
      stencilBuffer: false
    };
    this.isRTT = false;
    this.clearColor = clearColor;
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;

    this.fbo = new THREE.WebGLRenderTarget(
      this.worldWidth * this.width,
      this.worldHeight * this.height, this.renderTargetParameters
    );

    this.resize();
  }

  render(time) {
    var left = Math.floor(this.worldWidth * this.left);
    var top = Math.floor(this.worldHeight * this.top);
    var width = Math.floor(this.worldWidth * this.width);
    var height = Math.floor(this.worldHeight * this.height);
    this.renderer.setViewport(left, top, width, height);
    this.renderer.setScissor(left, top, width, height);
    this.renderer.setScissorTest(true);
    this.renderer.setClearColor(this.clearColor);
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    this.worldWidth = this.world.app.getWorldWidth();
    this.worldHeight = this.world.app.getWorldHeight();
    let width = Math.floor(this.worldWidth * this.width);
    let height = Math.floor(this.worldHeight * this.height);
    if (this.camera.type === 'PerspectiveCamera') {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    } else {
      this.camera.left = -width / 2;
      this.camera.right = width / 2;
      this.camera.top = height / 2;
      this.camera.bottom = -height / 2;
      this.camera.updateProjectionMatrix();
    }
  }
}

export {
  View
};