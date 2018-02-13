import { World } from './World.js';
import { APP_RUNNING, APP_STOP, APP_PAUSE } from './../constant.js';
import { LoopManager } from './LoopManager.js';
import { VR } from './VR.js';
import { EffectFactory } from './../effect/EffectFactory.js';

class App {
  constructor(parent, options = {}) {
    this.options = _.defaults(options, {
      setCommonCSS: true,
      autoStart: true
    });
    if (this.options.setCommonCSS) {
      this.setCommonCSS();
    }
    this.parent = parent || document.body;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.world = new World(this);
    this.animationFrame;
    this.state = APP_STOP;
    this.logicLoop = new LoopManager();
    this.renderLoop = new LoopManager();
    this.update = (time) => {
      if (this.state === APP_RUNNING) {
        this.logicLoop.update(time);
        this.world.update(time);
        this.renderLoop.update(time);
      }
      this.animationFrame = requestAnimationFrame(this.update);
    };

    this.resize = () => {
      let width = this.getWorldWidth();
      let height = this.getWorldHeight();

      this.world.resize(width, height);

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(1);
    };
    window.addEventListener('resize', this.resize);
    if (this.options.autoStart) {
      this.start();
    }
    this.effectFactory = new EffectFactory(this);
    this.VR = new VR(this);
  }

  setCommonCSS() {
    document.write(
      '<style>*{margin:0;padding:0} body{overflow:hidden}</style>');
  }

  getWorldWidth() {
    return this.parent === document.body ? window.innerWidth :
      this.parent.offsetWidth;
  }

  getWorldHeight() {
    return this.parent === document.body ? window.innerHeight :
      this.parent.offsetHeight;
  }

  start() {
    if (this.state === APP_STOP) {
      this.state = APP_RUNNING;
      this.parent.appendChild(this.renderer.domElement);
      this.resize();
      this.update();
    }
  }

  resume() {
    if (this.state === APP_PAUSE) {
      this.state = APP_RUNNING;
    }
  }

  pause() {
    if (this.state === APP_RUNNING) {
      this.state = APP_PAUSE;
    }
  }

  destroy() {
    this.world.destroy();
  }

  openFullScreen() {
    let container = this.parent;
    this.isFullScreen = true;
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.msRequestFullscreen) {
      container.msRequestFullscreen();
    } else if (container.mozRequestFullScreen) {
      container.mozRequestFullScreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else {
      this.isFullScreen = false;
    }
    return this.isFullScreen;
  }

  closeFullScreen() {
    let container = this.parent;
    this.isFullScreen = false;
    if (container.exitFullscreen) {
      container.exitFullscreen();
    } else if (container.mozCancelFullScreen) {
      container.mozCancelFullScreen();
    } else if (container.webkitExitFullScreen) {
      container.webkitExitFullScreen();
    } else if (container.msExitFullscreen) {
      container.msExitFullscreen();
    } else if (container.webkitCancelFullScreen) {
      container.webkitCancelFullScreen();
    }
    if (container.webkitExitFullScreen) {
      container.webkitCancelFullScreen();
    }
    return this.isFullScreen;
  }

  toggleFullScreen() {
    if (this.isFullScreen) {
      this.closeFullScreen();
    } else {
      this.openFullScreen();
    }
  }

  screenshot() {
    var w = window.open('', '');
    w.document.title = "Nova Screenshot";
    var img = new Image();
    this.renderer.render(this.world.scene, this.world.camera);
    img.src = app.renderer.domElement.toDataURL();
    w.document.body.appendChild(img);
  }
}

export {
  App
};