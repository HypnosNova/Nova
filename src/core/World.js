import { LoopManager } from './LoopManager.js';
import { EventManager } from './../events/EventManager';

class World {
  constructor(app, camera, clearColor) {
    this.app = app;
    this.scene = new THREE.Scene();
    this.logicLoop = new LoopManager();
    this.renderLoop = new LoopManager();
    this.camera = camera || new THREE.PerspectiveCamera(45, app.getWorldWidth() /
      app.getWorldHeight(), 0.01, 5000);
    this.receivers = this.scene.children;
    this.eventManager = new EventManager(this);
    this.renderTargetParameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat,
      stencilBuffer: false
    };
    this.isRTT = false;
    this.clearColor = clearColor || 0;
    this.fbo = new THREE.WebGLRenderTarget(this.app.getWorldWidth(),
      this.app.getWorldHeight(), this.renderTargetParameters);
    this.defaultRenderID = Symbol();
    this.renderLoop.add(() => {
      this.app.renderer.render(this.scene, this.camera);
    }, this.defaultRenderID);
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
  World
};