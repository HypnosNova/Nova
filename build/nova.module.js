let NotFunctionError$1 = class extends Error {
  constructor( message ) {
    super( message );
    this.name = 'NotFunctionError';
    this.message = message || 'The object is not a function.';
  }
};

class LoopManager {
  constructor(cycleLevel = 1) {
    //当它是true，不执行该循环
    this.disable = false;
    //记录循环次数
    this.times = 0;
    //每隔多少循环执行一次update，用于调整fps。数字越大，fps越低
    this.cycleLevel = cycleLevel <= 0 ? 1 : cycleLevel;
    this.functionMap = new Map();
  }

  update(time) {
    if (this.disable || this.times % this.cycleLevel !== 0) {
      return;
    }
    this.functionMap.forEach((value) => {
      value();
    });
  }

  add(func, key) {
    if (typeof func !== 'function') {
      throw new NotFunctionError$1();
    } else {
      if (key) {
        this.functionMap.set(key, func);
      } else {
        key = Symbol();
        this.functionMap.set(key, func);
        return key;
      }
    }
  }

  remove(funcOrKey) {
    if (typeof funcOrKey === 'function') {
      this.functionMap.forEach((value, key) => {
        if (value === funcOrKey) {
          return this.functionMap.delete(key);
        }
      });
      return false;
    } else {
      return this.functionMap.delete(funcOrKey);
    }
  }
}

class EventManager {
  constructor(world) {
    try {
    	if(Hammer===undefined){
    		return;
    	}
    } catch (e) {
      console.warn('Hammer没有引入导致鼠标或触屏事件功能无法使用。Nova的事件引擎依赖Hammer。');
      return;
    }
    
    world.eventManager = this;
    this.world = world;
    this.isDeep = true;
    this.receivers = world.receivers;
    this.raycaster = new THREE.Raycaster();
    this.centerRaycaster = new THREE.Raycaster();
    this.selectedObj = null;
    this.centerSelectedObj = null;
    this.isDetectingEnter = true;
    this.hammer = new Hammer(world.app.renderer.domElement);
    this.hammer.on('pan press tap pressup pandown panup', (event) => {
      this.raycastCheck(event);
    });
  }

  raycastCheck(event) {
    let vec2 = new THREE.Vector2(event.center.x / this.world.app.getWorldWidth() *
      2 - 1, 1 - event.center.y / this.world.app.getWorldHeight() * 2);
    this.raycaster.setFromCamera(vec2, this.world.camera);
    let intersects = this.raycaster.intersectObjects(this.world.receivers,
      this.isDeep);
    let intersect;
    for (let i = 0; i < intersects.length; i++) {
      if (intersects[i].object.isPenetrated) {
        continue;
      } else {
        intersect = intersects[i];
        break;
      }
    }
    if (intersect) {
      intersect.object.events[event.type].run(event, intersect);
    }
  }
}

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
      
    this.renderLoop.add(() => {
      this.app.renderer.render(this.scene, this.camera);
    });
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

const APP_STOP = 0;
const APP_RUNNING = 1;
const APP_PAUSE = 2;
const VERSION = '0.0.1';

console.log("Nova framework for Three.js, version: %c " + VERSION, "color:blue");

class VR {
  constructor(app) {
    this.app = app;
    this.display = undefined;
    this.polyfill = undefined;
    this.isOpenVR = false;
    this.vrEffect = undefined;
    this.getVRDisplay();
    this.createVREffect();
  }

  createVREffect() {
    if (this.vrEffect) {
      return;
    }
    if (!THREE.VREffect) {
      console.warn("未引入VREffect.js，无法创建VR模式。");
      return;
    }
    this.vrEffect = new THREE.VREffect(this.app.renderer);
    this.vrEffect.setSize(this.app.renderer.domElement.clientWidth,
      this.app.renderer.domElement.clientHeight, false);
    this.vrEffect.isOpened = false;
    this.vrEffect.updateId = Symbol();
  }

  setPolyfill() {
    if (this.polyfill) {
      return;
    }
    if (!window.WebVRPolyfill) {
      console.warn("未引入WebVRPolyfill.js，无法创建VR兼容模式。");
      return;
    }
    let config = (function() {
      let config = {};
      let q = window.location.search.substring(1);
      if (q === '') {
        return config;
      }
      let params = q.split('&');
      let param, name, value;
      for (let i = 0; i < params.length; i++) {
        param = params[i].split('=');
        name = param[0];
        value = param[1];

        // All config values are either boolean or float
        config[name] = value === 'true' ? true :
          value === 'false' ? false :
          parseFloat(value);
      }
      return config;
    })();
    this.polyfill = new WebVRPolyfill(config);
  }

  getVRDisplay() {
    if (!navigator.getVRDisplays) {
      this.setPolyfill();
    }
    if(!navigator.getVRDisplays){
    	return;
    }
    return navigator.getVRDisplays()
      .then((vrDisplays) => {
        if (vrDisplays.length) {
          this.display = vrDisplays[0];
          return this.display;
        }
        return "no";
      }, (vrDisplays) => {
        return "no";
      });
  }

  open() {
    if (!this.display || !this.vrEffect) {
      console.warn("未发现VR设备或浏览器不兼容，无法进入VR模式。");
      return;
    }
    this.app.renderLoop.add(() => {
      this.vrEffect.render(this.app.world.scene, this.app.world.camera);
    }, this.vrEffect.updateId);
    this.display.requestPresent([{ source: this.app.renderer.domElement }]);
  }

  close() {
    this.app.renderLoop.remove(this.vrEffect.updateId);
  }
}

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

class Transitioner {
  constructor(app, world, texture, options = {}) {
    this.options = _.defaults(options, {
      'useTexture': true,
      'transition': 0,
      'speed': 10,
      'texture': 5,
      'loopTexture': true,
      'isAnimate': true,
      'threshold': 0.3
    });
    this.app = app;
    this.targetWorld = world;
    this.maskTexture = texture;
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse1: {
          value: null
        },
        tDiffuse2: {
          value: null
        },
        mixRatio: {
          value: 0.0
        },
        threshold: {
          value: 0.1
        },
        useTexture: {
          value: 1
        },
        tMixTexture: {
          value: this.maskTexture
        }
      },
      vertexShader: `varying vec2 vUv;
        void main() {
        vUv = vec2( uv.x, uv.y );
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,
      fragmentShader: `uniform float mixRatio;
        uniform sampler2D tDiffuse1;
        uniform sampler2D tDiffuse2;
        uniform sampler2D tMixTexture;
        uniform int useTexture;
        uniform float threshold;
        varying vec2 vUv;
        
        void main() {

        vec4 texel1 = texture2D( tDiffuse1, vUv );
        vec4 texel2 = texture2D( tDiffuse2, vUv );

        if (useTexture==1) {

        vec4 transitionTexel = texture2D( tMixTexture, vUv );
        float r = mixRatio * (1.0 + threshold * 2.0) - threshold;
        float mixf=clamp((transitionTexel.r - r)*(1.0/threshold), 0.0, 1.0);

        gl_FragColor = mix( texel1, texel2, mixf );
        } else {

        gl_FragColor = mix( texel2, texel1, mixRatio );

        }
        }`
    });
    let halfWidth = app.getWorldWidth() / 2;
    let halfHeight = app.getWorldHeight() / 2;
    this.world = new World(app, new THREE.OrthographicCamera(-halfWidth,
      halfWidth, halfHeight, -halfHeight, -10, 10));

    let geometry = new THREE.PlaneBufferGeometry(halfWidth * 2,
      halfHeight * 2);

    let quad = new THREE.Mesh(geometry, this.material);
    this.world.scene.add(quad);

    this.sceneA = world;
    this.sceneB = app.world;

    this.material.uniforms.tDiffuse1.value = this.sceneA.fbo.texture;
    this.material.uniforms.tDiffuse2.value = this.sceneB.fbo.texture;

    this.needChange = false;
  }

  setThreshold(value) {
    this.material.uniforms.threshold.value = value;
  }

  useTexture(value) {
    this.material.uniforms.useTexture.value = value ? 1 : 0;
  }

  setTexture(i) {
    this.material.uniforms.tMixTexture.value = this.texture;
  }

  update() {
    let value = Math.min(this.options.transition, 1);
    value = Math.max(value, 0);
    this.material.uniforms.mixRatio.value = value;
    this.app.renderer.setClearColor(this.sceneB.clearColor || 0);
    this.sceneB.update();
    this.app.renderer.render(this.sceneB.scene, this.sceneB.camera, this.sceneB
      .fbo, true);
    this.app.renderer.setClearColor(this.sceneA.clearColor || 0);
    this.sceneA.update();
    this.app.renderer.render(this.sceneA.scene, this.sceneA.camera, this.sceneA
      .fbo, true);
    this.app.renderer.render(this.world.scene, this.world.camera, null, true);
  }
}

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

  render() {
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

/**
 * 用于事件处理
 * 
 * */
class Signal {
  constructor(type) {
    this.type = type;
    this.functionArr = [];
  }

  add(func) {
    if (typeof func !== 'function') {
      throw new NotFunctionError();
    } else {
      this.functionArr.push(func);
    }
  }

  remove(func) {
    return _.remove(this.functionArr, function(n) {
      return n === func;
    });
  }

  run(event, intersect) {
    this.functionArr.forEach(
      (func) => {
        func(event, intersect);
      });
  }
}

/**
 * 由于事件处理
 * 
 * */
class Events {
  constructor() {
    this.press = new Signal('press');
    this.pressup = new Signal('pressup');
    this.tap = new Signal('tap');
    this.enter = new Signal('enter');
    this.leave = new Signal('leave');
    this.pan = new Signal('pan');
    this.panleft = new Signal('panleft');
    this.panright = new Signal('panright');
    this.panstart = new Signal('panstart');
    this.pandown = new Signal('pandown');
    this.panup = new Signal('panup');
  }
}

class GUI extends THREE.Group {
  constructor() {
    super();
    this.css = {
      backgroundColor: "rgba(0,0,0,0)",
      opacity: 1,
      width: 1,
      height: 1
    };
  }
}

class Body extends GUI {
  constructor(world, css) {
    super();
    this.world = world;
    this.distanceFromCamera = 50;
    this.css = _.defaults(css || {}, this.css);
    this.canvas = document.createElement("canvas");
    var spriteMaterial = new THREE.SpriteMaterial({
      map: this.canvas,
      color: 0xffffff
    });
    this.element = new THREE.Sprite(spriteMaterial);
    this.vector = new THREE.Vector3();
    this.update();
    this.add(this.element);
  }

  lockToScreen() {
    var c = this.world.camera;
    c.getWorldDirection(this.vector);
    this.rotation.set(c.rotation.x, c.rotation.y, c.rotation.z);
    this.position.set(c.position.x + this.vector.x * this.distanceFromCamera,
      c.position.y +
      this.vector.y * this.distanceFromCamera, c.position.z + this.vector.z *
      this.distanceFromCamera
    );
  }

  update() {
    this.canvas.width = this.css.width;
    this.canvas.height = this.css.height;
    let ctx = this.canvas.getContext("2d");
    ctx.fillStyle = this.css.backgroundColor;
    ctx.fillRect(0, 0, this.css.width, this.css.height);
    var texture = new THREE.CanvasTexture(this.canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    var spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      color: 0xffffff
    });
    this.element.material.dispose();
    this.element.material = spriteMaterial;
    this.element.scale.set(this.css.width / 4, this.css.height / 4, 1);
  }
}

class Div extends GUI {
  constructor(world, css) {
    super();
    this.world = world;
    this.css = _.defaults(css || {}, this.css);
    this.canvas = document.createElement("canvas");
    var spriteMaterial = new THREE.SpriteMaterial({
      map: canvas,
      color: 0xffffff
    });
    this.element = new THREE.Sprite(spriteMaterial);
    this.vector = new THREE.Vector3();
    this.update();
    this.add(this.element);
  }

  update() {
    this.canvas.width = this.css.width;
    this.canvas.height = this.css.height;
    let ctx = this.canvas.getContext("2d");
    ctx.fillStyle = this.css.backgroundColor;
    ctx.fillRect(0, 0, this.css.width, this.css.height);
    var texture = new THREE.CanvasTexture(this.canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    var spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      color: 0xffffff
    });
    this.element.material.dispose();
    this.element.material = spriteMaterial;
    this.element.scale.set(this.css.width / 4, this.css.height / 4, 1);
  }
}

class Txt extends THREE.Mesh {
  constructor(text, css) {
    css = _.defaults(css || {}, {
      fontStyle: "normal",
      fontVariant: "normal",
      fontSize: 12,
      fontWeight: "normal",
      fontFamily: "微软雅黑",
      color: "#ffffff",
      textAlign: "center",
      backgroundColor: "rgba(0,0,0,0)",
      opacity: 1,
      width: 1,
      height: 1,
      scale: {
        x: 0.25,
        y: 0.25,
        z: 1,
      }
    });
    let canvas = document.createElement("canvas");
    var material = new THREE.MeshBasicMaterial({
      transparent: true,
      needsUpdate: false,
      color: 0xffffff
    });
    super(new THREE.PlaneBufferGeometry(css.width / 8, css.height / 8),
      material);
    this.text = text;
    this.canvas = canvas;
    this.css = css;
    this.update();
  }

  update() {
    this.canvas.width = this.css.width;
    this.canvas.height = this.css.height;
    let ctx = this.canvas.getContext("2d");
    ctx.fillStyle = this.css.backgroundColor;
    ctx.fillRect(0, 0, this.css.width, this.css.height);
    ctx.textAlign = this.css.textAlign;
    ctx.font = this.css.fontStyle + " " + this.css.fontVariant + " " + this
      .css.fontWeight +
      " " + this.css.fontSize + "px " + this.css.fontFamily;
    ctx.fillStyle = this.css.color;
    let width = ctx.measureText(this.text)
      .width;
    ctx.fillText(this.text, this.css.width / 2, this.css.height / 2 + this.css
      .fontSize / 4);
    var texture = new THREE.CanvasTexture(this.canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    this.material.map = texture;
    this.scale.set(this.css.scale.x, this.css.scale.y, this.css.scale.z);
    this.material.opacity = this.css.opacity;
  }
}

class LoaderFactory {
  constructor() {
    let manager = new THREE.LoadingManager();
    this.Resource = {
      images: {},
      materials: {},
      textures: {},
      models: {},
      sounds: {},
      fonts: {},
      unloaded: {
        textures: [],
        models: [],
        sounds: [],
        fonts: [],
        images: []
      }
    };

    manager.onStart = (url, itemsLoaded, itemsTotal) => {
      if (this.onStart && typeof this.onStart === 'function') {
        this.onStart(url, itemsLoaded, itemsTotal);
      }
    };

    manager.onLoad = () => {
      if (this.onLoad && typeof this.onLoad === 'function') {
        this.onLoad();
      }
    };

    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      if (this.onProgress && typeof this.onProgress === 'function') {
        this.onProgress(url, itemsLoaded, itemsTotal);
      }
    };

    manager.onError = (url) => {
      if (this.onError && typeof this.onError === 'function') {
        this.onError(url);
      }
    };

    this.imageLoader = new THREE.ImageLoader(manager);
    this.textureLoader = new THREE.TextureLoader(manager);
    this.audioListener = new THREE.AudioListener(manager);
  }

  loadImage(key, src) {
    this.imageLoader.load(src,
      (data) => {
        this.Resource.images[key] = data;
      }, undefined, (err) => {
        this.Resource.unloaded.images.push(src);
      }
    );
  }

  loadTexture(key, src) {
    this.textureLoader.load(src,
      (data) => {
        this.Resource.textures[key] = data;
      }, undefined, (err) => {
        this.Resource.unloaded.textures.push(src);
      }
    );
  }
}

let _extends = ( des, src, over ) => {
  let res = _extend( des, src, over );

  function _extend( des, src, over ) {
    let override = true;
    if( over === false ) {
      override = false;
    }
    if( src instanceof Array ) {
      for( let i = 0, len = src.length; i < len; i++ )
        _extend( des, src[ i ], override );
    }
    for( let i in src ) {
      if( override || !( i in des ) ) {
        des[ i ] = src[ i ];
      }
    }
    return des;
  }
  for( let i in src ) {
    delete res[ i ];
  }
  return res;
};

let rndInt = ( max ) => {
  return Math.floor( Math.random() * max );
};

let rndString = ( len ) => {
  if( len <= 0 ) {
    return '';
  }
  len = len - 1 || 31;
  let $chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let maxPos = $chars.length + 1;
  let pwd = $chars.charAt( Math.floor( Math.random() * ( maxPos - 10 ) ) );
  for( let i = 0; i < len; i++ ) {
    pwd += $chars.charAt( Math.floor( Math.random() * maxPos ) );
  }
  return pwd;
};

let Util = {
  extend: _extends,
  rndInt,
  rndString
};

/* eslint-disable */

//export * from './thirdparty/three.module.js';

export { App, LoopManager, Monitor, Transitioner, View, VR, World, EffectFactory, NotFunctionError$1 as NotFunctionError, EventManager, Events, Signal, GUI, Body, Txt, Div, LoaderFactory, Util };
//# sourceMappingURL=nova.module.js.map
