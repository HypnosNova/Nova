import { World } from './World.js';
import { LoopManager } from './LoopManager.js';

class OS {
  constructor(screen, width = 900, height = 1600, isHorizontal = false) {
    this.screen = screen;
    this.width = width;
    this.height = height;
    this.isHorizontal = isHorizontal;
    this.loop = new LoopManager();
  }

  resize() {
    let width = this.getWorldWidth();
    let height = this.getWorldHeight();
    this.world.resize(width, height);
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.options.renderer.pixelRatio);
  }

  update(time) {
    this.loop.update(time);
  }

}

export {
  OS
};