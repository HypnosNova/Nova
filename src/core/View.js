import { LoopManager } from './LoopManager.js';
import { EventManager } from './../events/EventManager';

class View {
  constructor(world, camera, {
    clearColor = 0x000000,
    top: 0,
    left: 0,
    width: 1,
    height: 1
  }) {
    this.world = world;
    this.scene = world.scene;
    this.logicLoop = new LoopManager();
    this.renderLoop = new LoopManager();
    this.camera = camera || new THREE.PerspectiveCamera(45, app.getWorldWidth() /
      app.getWorldHeight(), 0.01, 1000);
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
    	this.world.app.getWorldWidth() * this.width,
      this.world.app.getWorldHeight() * this.width, this.renderTargetParameters
    );
  }

  update(time) {
    this.logicLoop.update(time);
    this.renderLoop.update(time);
  }

  resize(width, height) {
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