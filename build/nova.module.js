//适合大部分WebGL的APP设置
let DefaultSettings = {
  parent: document.body, //APP所在DOM容器
  setCommonCSS: true, //设置默认CSS样式，无法滚动，超出区域不显示，取消所有内外边距
  autoStart: true, //自动执行渲染循环和逻辑循环
  autoResize: true, //自动拉伸自适应不同屏幕分辨率
  VRSupport: false, //是否加载VR支持模块
  renderer: {
    clearColor: 0x000000, //渲染器的默认清除颜色
    clearAlpha: 1, //渲染器的默认清除颜色的透明度
    pixelRatio: window.devicePixelRatio || 1, //用于移动平台的清晰度
    precision: 'highp', // 渲染精细度，默认为高
    antialias: true, //是否开启抗锯齿
    alpha: false, // 渲染器是否保存alpha缓冲
    logarithmicDepthBuffer: false, // 逻辑深度缓冲
    preserveDrawingBuffer: false
  },
  normalEventList: ['click', 'mousedown', 'mouseup', 'touchstart',
    'touchend', 'touchmove', 'mousemove'
  ], //默认开启的原生事件监听，不建议将所有的事件监听都写在里面，每一个事件监听都会增加一次射线法碰撞检测，如果不必要的事件过多会降低性能
  hammerEventList: 'press tap pressup pan swipe', //默认hammer手势事件的监听，同normalEventList一样，用到什么加入什么，不要一大堆东西全塞进去
};

class NotFunctionError extends Error {
  constructor( message ) {
    super( message );
    this.name = 'NotFunctionError';
    this.message = message || 'The object is not a function.';
  }
}

class LoopManager {
  constructor(cycleLevel = 1) {
    //当它是true，不执行该循环
    this.disable = false;
    //记录循环次数
    this.times = 0;
    //每隔多少循环执行一次update，用于调整fps。数字越大，fps越低
    this.cycleLevel = cycleLevel <= 1 ? 1 : cycleLevel;
    this.functionMap = new Map();
  }

  update(time) {
    this.times++;
    if (this.disable || (this.times % this.cycleLevel) !== 0) {
      return;
    }
    this.functionMap.forEach((value) => {
      value();
    });
  }

  add(func, key) {
    if (typeof func !== 'function') {
      throw new NotFunctionError();
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

  removeAll() {
    this.functionMap.clear();
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
	constructor( world ) {
		world.eventManager = this;
		this.world = world;
		this.disable = false;
		this.isDeep = true;
		this.receivers = world.receivers;
		this.raycaster = new THREE.Raycaster();
		this.centerRaycaster = new THREE.Raycaster();
		this.selectedObj = null;
		this.centerSelectedObj = null;
		this.isDetectingEnter = true;
		let normalEventList = world.app.options.normalEventList;

		for ( let eventItem of normalEventList ) {
			world.app.parent.addEventListener( eventItem, ( event ) => {
				if ( this.disable ) return;
				this.raycastCheck( this.toNovaEvent( event ) );
			} );
		}

		try {
			if ( Hammer === undefined ) {
				return;
			}
		} catch ( e ) {
			console.warn( 'Hammer没有引入，手势事件无法使用，只能使用基础的交互事件。' );
			return;
		}
		this.hammer = new Hammer( world.app.renderer.domElement );
		this.hammer.on( world.app.options.hammerEventList, ( event ) => {
			if ( this.disable ) return;
			this.raycastCheck( event );
		} );
	}

	toNovaEvent( event ) {
		return {
			changedPointers: [ event ],
			center: new THREE.Vector2( event.clientX, event.clientY ),
			type: event.type,
			target: event.target
		};
	}

	raycastCheck( event ) {
		let vec2 = new THREE.Vector2( event.center.x / this.world.app.getWorldWidth() *
			2 - 1, 1 - event.center.y / this.world.app.getWorldHeight() * 2 );
		this.raycaster.setFromCamera( vec2, this.world.camera );
		let intersects = this.raycaster.intersectObjects( this.world.receivers,
			this.isDeep );
		let intersect;
		for ( let i = 0; i < intersects.length; i++ ) {
			if ( intersects[ i ].object.isPenetrated ||
				!intersects[ i ].object.events ||
				!intersects[ i ].object.events[ event.type ] ) {
				continue;
			} else {
				intersect = intersects[ i ];
				break;
			}
		}
		if ( intersect ) {
			intersect.object.events[ event.type ].run( event, intersect );
		}
		return intersect;
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
		this.defaultRenderID = Symbol();
		this.renderLoop.add(() => {
			if (this.isRTT) {
				this.app.renderer.render(this.scene, this.camera, this.fbo, true);
			} else {
				this.app.renderer.render(this.scene, this.camera);
			}
		}, this.defaultRenderID);
		this.defaultUpdateID = Symbol();
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

class App {
	constructor(settings = {}) {
		this.options = _.defaultsDeep(settings, DefaultSettings);
		if (this.options.setCommonCSS) {
			this.setCommonCSS();
		}
		this.parent = this.options.parent;
		this.renderer = new THREE.WebGLRenderer({
			antialias: this.options.renderer.antialias,
			precision: this.options.renderer.precision,
			alpha: this.options.renderer.alpha,
			logarithmicDepthBuffer: this.options.renderer.logarithmicDepthBuffer,
			preserveDrawingBuffer: this.options.renderer.preserveDrawingBuffer
		});
		this.renderer.setClearColor(this.options.renderer.clearColor,
			this.options.renderer.clearAlpha);
		this.world = new World(this);
		this.animationFrame;
		this.state = APP_STOP;
		this.logicLoop = new LoopManager();
		this.renderLoop = new LoopManager();
		window.addEventListener('resize', () => {
			this.resize();
		});
		if (this.options.autoStart) {
			this.start();
		}
		if (this.options.VRSupport) {
			this.VR = new VR(this);
		}
	}

	resize() {
		let width = this.getWorldWidth();
		let height = this.getWorldHeight();
		this.world.resize(width, height);
		this.renderer.setSize(width, height);
		this.renderer.setPixelRatio(this.options.renderer.pixelRatio);
	}

	update(time) {
		if (this.state === APP_RUNNING) {
			this.logicLoop.update(time);
			this.world.update(time);
			this.renderLoop.update(time);
		}
		this.animationFrame = requestAnimationFrame(() => {
			this.update();
		});
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
		let container = document;
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
		} else if (container.webkitExitFullScreen) {
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
		let img = new Image();
		this.renderer.render(this.world.scene, this.world.camera);
		img.src = this.renderer.domElement.toDataURL();
		let w = window.open('', '');
		w.document.title = "Nova Screenshot";
		w.document.body.appendChild(img);
	}

	sceneCoordinateToCanvasCoordinate(obj, camera = this.world.camera) {
		let worldVector = obj instanceof THREE.Vector3 ? obj.clone() : obj.position.clone();
		let vector = worldVector.project(camera);
		let halfWidth = this.getWorldWidth() / 2;
		let halfHeight = this.getWorldHeight() / 2;

		return new THREE.Vector2(Math.round(vector.x * halfWidth + halfWidth),
			Math.round(-vector.y * halfHeight + halfHeight));
	}
}

class Bind {
  constructor(obj) {
    for (let i in obj) {
      this[i] = obj[i];
      this.bindMap = new Map();
      this.defineReactive(this, i, this[i]);
    }
  }

  add(obj, funcs = {}) {
    this.bindMap.set(obj, funcs);
  }

  remove(obj) {
    this.bindMap.delete(obj);
  }

  defineReactive(data, key, val) {
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: false,
      get: function() {
        return val;
      },
      set: function(newVal) {
        val = newVal;
        let bindMap = data.bindMap;
        for (let [obj, funcs] of bindMap) {
          if (obj[key] !== undefined) {
            obj[key] = funcs[key] ? funcs[key](val, obj) : val;
          }
        }
      }
    });
  }
}

class FBOWorld {
  constructor(app, camera, width, height) {
    this.width = width;
    this.height = height;
    this.app = app;
    this.scene = new THREE.Scene();
    this.logicLoop = new LoopManager();
    this.renderLoop = new LoopManager();
    this.camera = camera || new THREE.PerspectiveCamera(45, this.width /
      this.height, 0.01, 5000);
    this.receivers = this.scene.children;

    this.renderTargetParameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat,
      stencilBuffer: false
    };
    this.clearColor = 0;
    this.fbo = new THREE.WebGLRenderTarget(this.width,
      this.height, this.renderTargetParameters);
    this.defaultRenderID = Symbol();
    this.defaultUpdateID = Symbol();
    this.resize();
    this.renderLoop.add(() => {
      this.app.renderer.render(this.scene, this.camera, this.fbo, true);
    }, this.defaultRenderID);
  }

  update(time) {
    this.logicLoop.update(time);
    this.renderLoop.update(time);
  }

  resize() {
    if (this.camera.type === 'PerspectiveCamera') {
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
    } else {
      this.camera.left = -this.width / 2;
      this.camera.right = this.width / 2;
      this.camera.top = this.height / 2;
      this.camera.bottom = -this.height / 2;
      this.camera.updateProjectionMatrix();
    }
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

	resize(option) {
		this.option = option;
		this.fullWidth = this.world.app.getWorldWidth();
		this.fullHeight = this.world.app.getWorldHeight();
		this.renderer.setSize(this.fullWidth * option.width, this.fullHeight *
			option.height);
		this.setViewOffset();
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

const QRMode = {
  MODE_NUMBER: 1 << 0,
  MODE_ALPHA_NUM: 1 << 1,
  MODE_8BIT_BYTE: 1 << 2,
  MODE_KANJI: 1 << 3
};

class QR8bitByte {
  constructor(data) {
    this.mode = QRMode.MODE_8BIT_BYTE;
    this.data = data;
    this.parsedData = [];

    for (let i = 0, l = this.data.length; i < l; i++) {
      let byteArray = [];
      let code = this.data.charCodeAt(i);

      if (code > 0x10000) {
        byteArray[0] = 0xF0 | ((code & 0x1C0000) >>> 18);
        byteArray[1] = 0x80 | ((code & 0x3F000) >>> 12);
        byteArray[2] = 0x80 | ((code & 0xFC0) >>> 6);
        byteArray[3] = 0x80 | (code & 0x3F);
      } else if (code > 0x800) {
        byteArray[0] = 0xE0 | ((code & 0xF000) >>> 12);
        byteArray[1] = 0x80 | ((code & 0xFC0) >>> 6);
        byteArray[2] = 0x80 | (code & 0x3F);
      } else if (code > 0x80) {
        byteArray[0] = 0xC0 | ((code & 0x7C0) >>> 6);
        byteArray[1] = 0x80 | (code & 0x3F);
      } else {
        byteArray[0] = code;
      }

      this.parsedData.push(byteArray);
    }

    this.parsedData = Array.prototype.concat.apply([], this.parsedData);

    if (this.parsedData.length !== this.data.length) {
      this.parsedData.unshift(191);
      this.parsedData.unshift(187);
      this.parsedData.unshift(239);
    }
  }

  getLength(buffer) {
    return this.parsedData.length;
  }

  write(buffer) {
    for (let i = 0, l = this.parsedData.length; i < l; i++) {
      buffer.put(this.parsedData[i], 8);
    }
  }
}

class QRCodeModel {
  constructor(typeNumber, errorCorrectLevel) {
    this.typeNumber = typeNumber;
    this.errorCorrectLevel = errorCorrectLevel;
    this.modules = undefined;
    this.moduleCount = 0;
    this.dataCache = undefined;
    this.dataList = [];
  }
  addData(data) {
    let newData = new QR8bitByte(data);
    this.dataList.push(newData);
    this.dataCache = undefined;
  }

  isDark(row, col) {
    if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <=
      col) {
      throw new Error(row + "," + col);
    }
    return this.modules[row][col];
  }

  getModuleCount() {
    return this.moduleCount;
  }

  make() {
    this.makeImpl(false, this.getBestMaskPattern());
  }

  makeImpl(test, maskPattern) {
    this.moduleCount = this.typeNumber * 4 + 17;
    this.modules = new Array(this.moduleCount);
    for (let row = 0; row < this.moduleCount; row++) {
      this.modules[row] = new Array(this.moduleCount);
      for (let col = 0; col < this.moduleCount; col++) {
        this.modules[row][col] = undefined;
      }
    }
    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);
    this.setupPositionAdjustPattern();
    this.setupTimingPattern();
    this.setupTypeInfo(test, maskPattern);
    if (this.typeNumber >= 7) {
      this.setupTypeNumber(test);
    }
    if (this.dataCache === undefined) {
      this.dataCache = QRCodeModel.createData(this.typeNumber, this.errorCorrectLevel,
        this.dataList);
    }
    this.mapData(this.dataCache, maskPattern);
  }

  setupPositionProbePattern(row, col) {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || this.moduleCount <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || this.moduleCount <= col + c) continue;
        if ((0 <= r && r <= 6 && (c === 0 || c === 6)) || (0 <= c && c <=
            6 && (r === 0 || r === 6)) || (2 <= r && r <= 4 && 2 <= c &&
            c <= 4)) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  }

  getBestMaskPattern() {
    let minLostPoint = 0;
    let pattern = 0;
    for (let i = 0; i < 8; i++) {
      this.makeImpl(true, i);
      let lostPoint = QRUtil.getLostPoint(this);
      if (i === 0 || minLostPoint > lostPoint) {
        minLostPoint = lostPoint;
        pattern = i;
      }
    }
    return pattern;
  }

  createMovieClip(target_mc, instance_name, depth) {
    let qr_mc = target_mc.createEmptyMovieClip(instance_name, depth);
    let cs = 1;
    this.make();
    for (let row = 0; row < this.modules.length; row++) {
      let y = row * cs;
      for (let col = 0; col < this.modules[row].length; col++) {
        let x = col * cs;
        let dark = this.modules[row][col];
        if (dark) {
          qr_mc.beginFill(0, 100);
          qr_mc.moveTo(x, y);
          qr_mc.lineTo(x + cs, y);
          qr_mc.lineTo(x + cs, y + cs);
          qr_mc.lineTo(x, y + cs);
          qr_mc.endFill();
        }
      }
    }
    return qr_mc;
  }

  setupTimingPattern() {
    for (let r = 8; r < this.moduleCount - 8; r++) {
      if (this.modules[r][6] !== undefined) {
        continue;
      }
      this.modules[r][6] = (r % 2 === 0);
    }
    for (let c = 8; c < this.moduleCount - 8; c++) {
      if (this.modules[6][c] !== undefined) {
        continue;
      }
      this.modules[6][c] = (c % 2 === 0);
    }
  }

  setupPositionAdjustPattern() {
    let pos = QRUtil.getPatternPosition(this.typeNumber);
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        let row = pos[i];
        let col = pos[j];
        if (this.modules[row][col] !== undefined) {
          continue;
        }
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c ==
                0)) {
              this.modules[row + r][col + c] = true;
            } else {
              this.modules[row + r][col + c] = false;
            }
          }
        }
      }
    }
  }

  setupTypeNumber(test) {
    let bits = QRUtil.getBCHTypeNumber(this.typeNumber);
    for (let i = 0; i < 18; i++) {
      let mod = (!test && ((bits >> i) & 1) === 1);
      this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] =
        mod;
    }
    for (let i = 0; i < 18; i++) {
      let mod = (!test && ((bits >> i) & 1) === 1);
      this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] =
        mod;
    }
  }

  setupTypeInfo(test, maskPattern) {
    let data = (this.errorCorrectLevel << 3) | maskPattern;
    let bits = QRUtil.getBCHTypeInfo(data);
    for (let i = 0; i < 15; i++) {
      let mod = (!test && ((bits >> i) & 1) === 1);
      if (i < 6) {
        this.modules[i][8] = mod;
      } else if (i < 8) {
        this.modules[i + 1][8] = mod;
      } else {
        this.modules[this.moduleCount - 15 + i][8] = mod;
      }
    }
    for (let i = 0; i < 15; i++) {
      let mod = (!test && ((bits >> i) & 1) === 1);
      if (i < 8) {
        this.modules[8][this.moduleCount - i - 1] = mod;
      } else if (i < 9) {
        this.modules[8][15 - i - 1 + 1] = mod;
      } else {
        this.modules[8][15 - i - 1] = mod;
      }
    }
    this.modules[this.moduleCount - 8][8] = (!test);
  }

  mapData(data, maskPattern) {
    let inc = -1;
    let row = this.moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;
    for (let col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      while (true) {
        for (let c = 0; c < 2; c++) {
          if (this.modules[row][col - c] === undefined) {
            let dark = false;
            if (byteIndex < data.length) {
              dark = (((data[byteIndex] >>> bitIndex) & 1) === 1);
            }
            let mask = QRUtil.getMask(maskPattern, row, col - c);
            if (mask) {
              dark = !dark;
            }
            this.modules[row][col - c] = dark;
            bitIndex--;
            if (bitIndex === -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }
        row += inc;
        if (row < 0 || this.moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }
}

QRCodeModel.PAD0 = 0xEC;
QRCodeModel.PAD1 = 0x11;
QRCodeModel.createData = function(typeNumber, errorCorrectLevel, dataList) {
  let rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
  let buffer = new QRBitBuffer();
  for (let i = 0; i < dataList.length; i++) {
    let data = dataList[i];
    buffer.put(data.mode, 4);
    buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode,
      typeNumber));
    data.write(buffer);
  }
  let totalDataCount = 0;
  for (let i = 0; i < rsBlocks.length; i++) {
    totalDataCount += rsBlocks[i].dataCount;
  }
  if (buffer.getLengthInBits() > totalDataCount * 8) {
    throw new Error("code length overflow. (" +
      buffer.getLengthInBits() +
      ">" +
      totalDataCount * 8 +
      ")");
  }
  if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
    buffer.put(0, 4);
  }
  while (buffer.getLengthInBits() % 8 !== 0) {
    buffer.putBit(false);
  }
  while (true) {
    if (buffer.getLengthInBits() >= totalDataCount * 8) {
      break;
    }
    buffer.put(QRCodeModel.PAD0, 8);
    if (buffer.getLengthInBits() >= totalDataCount * 8) {
      break;
    }
    buffer.put(QRCodeModel.PAD1, 8);
  }
  return QRCodeModel.createBytes(buffer, rsBlocks);
};
QRCodeModel.createBytes = function(buffer, rsBlocks) {
  let offset = 0;
  let maxDcCount = 0;
  let maxEcCount = 0;
  let dcdata = new Array(rsBlocks.length);
  let ecdata = new Array(rsBlocks.length);
  for (let r = 0; r < rsBlocks.length; r++) {
    let dcCount = rsBlocks[r].dataCount;
    let ecCount = rsBlocks[r].totalCount - dcCount;
    maxDcCount = Math.max(maxDcCount, dcCount);
    maxEcCount = Math.max(maxEcCount, ecCount);
    dcdata[r] = new Array(dcCount);
    for (let i = 0; i < dcdata[r].length; i++) {
      dcdata[r][i] = 0xff & buffer.buffer[i + offset];
    }
    offset += dcCount;
    let rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
    let rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
    let modPoly = rawPoly.mod(rsPoly);
    ecdata[r] = new Array(rsPoly.getLength() - 1);
    for (let i = 0; i < ecdata[r].length; i++) {
      let modIndex = i + modPoly.getLength() - ecdata[r].length;
      ecdata[r][i] = (modIndex >= 0) ? modPoly.get(modIndex) : 0;
    }
  }
  let totalCodeCount = 0;
  for (let i = 0; i < rsBlocks.length; i++) {
    totalCodeCount += rsBlocks[i].totalCount;
  }
  let data = new Array(totalCodeCount);
  let index = 0;
  for (let i = 0; i < maxDcCount; i++) {
    for (let r = 0; r < rsBlocks.length; r++) {
      if (i < dcdata[r].length) {
        data[index++] = dcdata[r][i];
      }
    }
  }
  for (let i = 0; i < maxEcCount; i++) {
    for (let r = 0; r < rsBlocks.length; r++) {
      if (i < ecdata[r].length) {
        data[index++] = ecdata[r][i];
      }
    }
  }
  return data;
};

const QRErrorCorrectLevel = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2
};
const QRMaskPattern = {
  PATTERN000: 0,
  PATTERN001: 1,
  PATTERN010: 2,
  PATTERN011: 3,
  PATTERN100: 4,
  PATTERN101: 5,
  PATTERN110: 6,
  PATTERN111: 7
};
let QRUtil = {
  PATTERN_POSITION_TABLE: [
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
    [6, 30, 54],
    [6, 32, 58],
    [6, 34, 62],
    [6, 26, 46, 66],
    [6, 26, 48, 70],
    [6, 26, 50, 74],
    [6, 30, 54, 78],
    [6, 30, 56, 82],
    [6, 30, 58, 86],
    [6, 34, 62, 90],
    [6, 28, 50, 72, 94],
    [6, 26, 50, 74, 98],
    [6, 30, 54, 78, 102],
    [6, 28, 54, 80, 106],
    [6, 32, 58, 84, 110],
    [6, 30, 58, 86, 114],
    [6, 34, 62, 90, 118],
    [6, 26, 50, 74, 98, 122],
    [6, 30, 54, 78, 102, 126],
    [6, 26, 52, 78, 104, 130],
    [6, 30, 56, 82, 108, 134],
    [6, 34, 60, 86, 112, 138],
    [6, 30, 58, 86, 114, 142],
    [6, 34, 62, 90, 118, 146],
    [6, 30, 54, 78, 102, 126, 150],
    [6, 24, 50, 76, 102, 128, 154],
    [6, 28, 54, 80, 106, 132, 158],
    [6, 32, 58, 84, 110, 136, 162],
    [6, 26, 54, 82, 110, 138, 166],
    [6, 30, 58, 86, 114, 142, 170]
  ],
  G15: (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) |
    (1 << 0),
  G18: (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) |
    (1 << 2) | (1 << 0),
  G15_MASK: (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1),
  getBCHTypeInfo: function(data) {
    let d = data << 10;
    while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
      d ^= (QRUtil.G15 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(
        QRUtil.G15)));
    }
    return ((data << 10) | d) ^ QRUtil.G15_MASK;
  },
  getBCHTypeNumber: function(data) {
    let d = data << 12;
    while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
      d ^= (QRUtil.G18 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(
        QRUtil.G18)));
    }
    return (data << 12) | d;
  },
  getBCHDigit: function(data) {
    let digit = 0;
    while (data !== 0) {
      digit++;
      data >>>= 1;
    }
    return digit;
  },
  getPatternPosition: function(typeNumber) {
    return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
  },
  getMask: function(maskPattern, i, j) {
    switch (maskPattern) {
      case QRMaskPattern.PATTERN000:
        return (i + j) % 2 === 0;
      case QRMaskPattern.PATTERN001:
        return i % 2 === 0;
      case QRMaskPattern.PATTERN010:
        return j % 3 === 0;
      case QRMaskPattern.PATTERN011:
        return (i + j) % 3 === 0;
      case QRMaskPattern.PATTERN100:
        return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
      case QRMaskPattern.PATTERN101:
        return (i * j) % 2 + (i * j) % 3 === 0;
      case QRMaskPattern.PATTERN110:
        return ((i * j) % 2 + (i * j) % 3) % 2 === 0;
      case QRMaskPattern.PATTERN111:
        return ((i * j) % 3 + (i + j) % 2) % 2 === 0;
      default:
        throw new Error("bad maskPattern:" + maskPattern);
    }
  },
  getErrorCorrectPolynomial: function(errorCorrectLength) {
    let a = new QRPolynomial([1], 0);
    for (let i = 0; i < errorCorrectLength; i++) {
      a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
    }
    return a;
  },
  getLengthInBits: function(mode, type) {
    if (1 <= type && type < 10) {
      switch (mode) {
        case QRMode.MODE_NUMBER:
          return 10;
        case QRMode.MODE_ALPHA_NUM:
          return 9;
        case QRMode.MODE_8BIT_BYTE:
          return 8;
        case QRMode.MODE_KANJI:
          return 8;
        default:
          throw new Error("mode:" + mode);
      }
    } else if (type < 27) {
      switch (mode) {
        case QRMode.MODE_NUMBER:
          return 12;
        case QRMode.MODE_ALPHA_NUM:
          return 11;
        case QRMode.MODE_8BIT_BYTE:
          return 16;
        case QRMode.MODE_KANJI:
          return 10;
        default:
          throw new Error("mode:" + mode);
      }
    } else if (type < 41) {
      switch (mode) {
        case QRMode.MODE_NUMBER:
          return 14;
        case QRMode.MODE_ALPHA_NUM:
          return 13;
        case QRMode.MODE_8BIT_BYTE:
          return 16;
        case QRMode.MODE_KANJI:
          return 12;
        default:
          throw new Error("mode:" + mode);
      }
    } else {
      throw new Error("type:" + type);
    }
  },
  getLostPoint: function(qrCode) {
    let moduleCount = qrCode.getModuleCount();
    let lostPoint = 0;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        let sameCount = 0;
        let dark = qrCode.isDark(row, col);
        for (let r = -1; r <= 1; r++) {
          if (row + r < 0 || moduleCount <= row + r) {
            continue;
          }
          for (let c = -1; c <= 1; c++) {
            if (col + c < 0 || moduleCount <= col + c) {
              continue;
            }
            if (r === 0 && c === 0) {
              continue;
            }
            if (dark === qrCode.isDark(row + r, col + c)) {
              sameCount++;
            }
          }
        }
        if (sameCount > 5) {
          lostPoint += (3 + sameCount - 5);
        }
      }
    }
    for (let row = 0; row < moduleCount - 1; row++) {
      for (let col = 0; col < moduleCount - 1; col++) {
        let count = 0;
        if (qrCode.isDark(row, col)) count++;
        if (qrCode.isDark(row + 1, col)) count++;
        if (qrCode.isDark(row, col + 1)) count++;
        if (qrCode.isDark(row + 1, col + 1)) count++;
        if (count === 0 || count === 4) {
          lostPoint += 3;
        }
      }
    }
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount - 6; col++) {
        if (qrCode.isDark(row, col) && !qrCode.isDark(row, col + 1) &&
          qrCode.isDark(row, col + 2) && qrCode.isDark(row, col + 3) &&
          qrCode.isDark(row, col + 4) && !qrCode.isDark(row, col + 5) &&
          qrCode.isDark(row, col + 6)) {
          lostPoint += 40;
        }
      }
    }
    for (let col = 0; col < moduleCount; col++) {
      for (let row = 0; row < moduleCount - 6; row++) {
        if (qrCode.isDark(row, col) && !qrCode.isDark(row + 1, col) &&
          qrCode.isDark(row + 2, col) && qrCode.isDark(row + 3, col) &&
          qrCode.isDark(row + 4, col) && !qrCode.isDark(row + 5, col) &&
          qrCode.isDark(row + 6, col)) {
          lostPoint += 40;
        }
      }
    }
    let darkCount = 0;
    for (let col = 0; col < moduleCount; col++) {
      for (let row = 0; row < moduleCount; row++) {
        if (qrCode.isDark(row, col)) {
          darkCount++;
        }
      }
    }
    let ratio = Math.abs(100 * darkCount / moduleCount / moduleCount -
      50) / 5;
    lostPoint += ratio * 10;
    return lostPoint;
  }
};
let QRMath = {
  glog: function(n) {
    if (n < 1) {
      throw new Error("glog(" + n + ")");
    }
    return QRMath.LOG_TABLE[n];
  },
  gexp: function(n) {
    while (n < 0) {
      n += 255;
    }
    while (n >= 256) {
      n -= 255;
    }
    return QRMath.EXP_TABLE[n];
  },
  EXP_TABLE: new Array(256),
  LOG_TABLE: new Array(256)
};
for (let i = 0; i < 8; i++) {
  QRMath.EXP_TABLE[i] = 1 << i;
}
for (let i = 8; i < 256; i++) {
  QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^
    QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
}
for (let i = 0; i < 255; i++) {
  QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
}

function QRPolynomial(num, shift) {
  if (num.length === undefined) {
    throw new Error(num.length + "/" + shift);
  }
  let offset = 0;
  while (offset < num.length && num[offset] === 0) {
    offset++;
  }
  this.num = new Array(num.length - offset + shift);
  for (let i = 0; i < num.length - offset; i++) {
    this.num[i] = num[i + offset];
  }
}
QRPolynomial.prototype = {
  get: function(index) {
    return this.num[index];
  },
  getLength: function() {
    return this.num.length;
  },
  multiply: function(e) {
    let num = new Array(this.getLength() + e.getLength() - 1);
    for (let i = 0; i < this.getLength(); i++) {
      for (let j = 0; j < e.getLength(); j++) {
        num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(
          e.get(j)));
      }
    }
    return new QRPolynomial(num, 0);
  },
  mod: function(e) {
    if (this.getLength() - e.getLength() < 0) {
      return this;
    }
    let ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
    let num = new Array(this.getLength());
    for (let i = 0; i < this.getLength(); i++) {
      num[i] = this.get(i);
    }
    for (let i = 0; i < e.getLength(); i++) {
      num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
    }
    return new QRPolynomial(num, 0)
      .mod(e);
  }
};

function QRRSBlock(totalCount, dataCount) {
  this.totalCount = totalCount;
  this.dataCount = dataCount;
}
QRRSBlock.RS_BLOCK_TABLE = [
  [1, 26, 19],
  [1, 26, 16],
  [1, 26, 13],
  [1, 26, 9],
  [1, 44, 34],
  [1, 44, 28],
  [1, 44, 22],
  [1, 44, 16],
  [1, 70, 55],
  [1, 70, 44],
  [2, 35, 17],
  [2, 35, 13],
  [1, 100, 80],
  [2, 50, 32],
  [2, 50, 24],
  [4, 25, 9],
  [1, 134, 108],
  [2, 67, 43],
  [2, 33, 15, 2, 34, 16],
  [2, 33, 11, 2, 34, 12],
  [2, 86, 68],
  [4, 43, 27],
  [4, 43, 19],
  [4, 43, 15],
  [2, 98, 78],
  [4, 49, 31],
  [2, 32, 14, 4, 33, 15],
  [4, 39, 13, 1, 40, 14],
  [2, 121, 97],
  [2, 60, 38, 2, 61, 39],
  [4, 40, 18, 2, 41, 19],
  [4, 40, 14, 2, 41, 15],
  [2, 146, 116],
  [3, 58, 36, 2, 59, 37],
  [4, 36, 16, 4, 37, 17],
  [4, 36, 12, 4, 37, 13],
  [2, 86, 68, 2, 87, 69],
  [4, 69, 43, 1, 70, 44],
  [6, 43, 19, 2, 44, 20],
  [6, 43, 15, 2, 44, 16],
  [4, 101, 81],
  [1, 80, 50, 4, 81, 51],
  [4, 50, 22, 4, 51, 23],
  [3, 36, 12, 8, 37, 13],
  [2, 116, 92, 2, 117, 93],
  [6, 58, 36, 2, 59, 37],
  [4, 46, 20, 6, 47, 21],
  [7, 42, 14, 4, 43, 15],
  [4, 133, 107],
  [8, 59, 37, 1, 60, 38],
  [8, 44, 20, 4, 45, 21],
  [12, 33, 11, 4, 34, 12],
  [3, 145, 115, 1, 146, 116],
  [4, 64, 40, 5, 65, 41],
  [11, 36, 16, 5, 37, 17],
  [11, 36, 12, 5, 37, 13],
  [5, 109, 87, 1, 110, 88],
  [5, 65, 41, 5, 66, 42],
  [5, 54, 24, 7, 55, 25],
  [11, 36, 12],
  [5, 122, 98, 1, 123, 99],
  [7, 73, 45, 3, 74, 46],
  [15, 43, 19, 2, 44, 20],
  [3, 45, 15, 13, 46, 16],
  [1, 135, 107, 5, 136, 108],
  [10, 74, 46, 1, 75, 47],
  [1, 50, 22, 15, 51, 23],
  [2, 42, 14, 17, 43, 15],
  [5, 150, 120, 1, 151, 121],
  [9, 69, 43, 4, 70, 44],
  [17, 50, 22, 1, 51, 23],
  [2, 42, 14, 19, 43, 15],
  [3, 141, 113, 4, 142, 114],
  [3, 70, 44, 11, 71, 45],
  [17, 47, 21, 4, 48, 22],
  [9, 39, 13, 16, 40, 14],
  [3, 135, 107, 5, 136, 108],
  [3, 67, 41, 13, 68, 42],
  [15, 54, 24, 5, 55, 25],
  [15, 43, 15, 10, 44, 16],
  [4, 144, 116, 4, 145, 117],
  [17, 68, 42],
  [17, 50, 22, 6, 51, 23],
  [19, 46, 16, 6, 47, 17],
  [2, 139, 111, 7, 140, 112],
  [17, 74, 46],
  [7, 54, 24, 16, 55, 25],
  [34, 37, 13],
  [4, 151, 121, 5, 152, 122],
  [4, 75, 47, 14, 76, 48],
  [11, 54, 24, 14, 55, 25],
  [16, 45, 15, 14, 46, 16],
  [6, 147, 117, 4, 148, 118],
  [6, 73, 45, 14, 74, 46],
  [11, 54, 24, 16, 55, 25],
  [30, 46, 16, 2, 47, 17],
  [8, 132, 106, 4, 133, 107],
  [8, 75, 47, 13, 76, 48],
  [7, 54, 24, 22, 55, 25],
  [22, 45, 15, 13, 46, 16],
  [10, 142, 114, 2, 143, 115],
  [19, 74, 46, 4, 75, 47],
  [28, 50, 22, 6, 51, 23],
  [33, 46, 16, 4, 47, 17],
  [8, 152, 122, 4, 153, 123],
  [22, 73, 45, 3, 74, 46],
  [8, 53, 23, 26, 54, 24],
  [12, 45, 15, 28, 46, 16],
  [3, 147, 117, 10, 148, 118],
  [3, 73, 45, 23, 74, 46],
  [4, 54, 24, 31, 55, 25],
  [11, 45, 15, 31, 46, 16],
  [7, 146, 116, 7, 147, 117],
  [21, 73, 45, 7, 74, 46],
  [1, 53, 23, 37, 54, 24],
  [19, 45, 15, 26, 46, 16],
  [5, 145, 115, 10, 146, 116],
  [19, 75, 47, 10, 76, 48],
  [15, 54, 24, 25, 55, 25],
  [23, 45, 15, 25, 46, 16],
  [13, 145, 115, 3, 146, 116],
  [2, 74, 46, 29, 75, 47],
  [42, 54, 24, 1, 55, 25],
  [23, 45, 15, 28, 46, 16],
  [17, 145, 115],
  [10, 74, 46, 23, 75, 47],
  [10, 54, 24, 35, 55, 25],
  [19, 45, 15, 35, 46, 16],
  [17, 145, 115, 1, 146, 116],
  [14, 74, 46, 21, 75, 47],
  [29, 54, 24, 19, 55, 25],
  [11, 45, 15, 46, 46, 16],
  [13, 145, 115, 6, 146, 116],
  [14, 74, 46, 23, 75, 47],
  [44, 54, 24, 7, 55, 25],
  [59, 46, 16, 1, 47, 17],
  [12, 151, 121, 7, 152, 122],
  [12, 75, 47, 26, 76, 48],
  [39, 54, 24, 14, 55, 25],
  [22, 45, 15, 41, 46, 16],
  [6, 151, 121, 14, 152, 122],
  [6, 75, 47, 34, 76, 48],
  [46, 54, 24, 10, 55, 25],
  [2, 45, 15, 64, 46, 16],
  [17, 152, 122, 4, 153, 123],
  [29, 74, 46, 14, 75, 47],
  [49, 54, 24, 10, 55, 25],
  [24, 45, 15, 46, 46, 16],
  [4, 152, 122, 18, 153, 123],
  [13, 74, 46, 32, 75, 47],
  [48, 54, 24, 14, 55, 25],
  [42, 45, 15, 32, 46, 16],
  [20, 147, 117, 4, 148, 118],
  [40, 75, 47, 7, 76, 48],
  [43, 54, 24, 22, 55, 25],
  [10, 45, 15, 67, 46, 16],
  [19, 148, 118, 6, 149, 119],
  [18, 75, 47, 31, 76, 48],
  [34, 54, 24, 34, 55, 25],
  [20, 45, 15, 61, 46, 16]
];
QRRSBlock.getRSBlocks = function(typeNumber, errorCorrectLevel) {
  let rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
  if (rsBlock === undefined) {
    throw new Error("bad rs block @ typeNumber:" + typeNumber +
      "/errorCorrectLevel:" + errorCorrectLevel);
  }
  let length = rsBlock.length / 3;
  let list = [];
  for (let i = 0; i < length; i++) {
    let count = rsBlock[i * 3 + 0];
    let totalCount = rsBlock[i * 3 + 1];
    let dataCount = rsBlock[i * 3 + 2];
    for (let j = 0; j < count; j++) {
      list.push(new QRRSBlock(totalCount, dataCount));
    }
  }
  return list;
};
QRRSBlock.getRsBlockTable = function(typeNumber, errorCorrectLevel) {
  switch (errorCorrectLevel) {
    case QRErrorCorrectLevel.L:
      return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
    case QRErrorCorrectLevel.M:
      return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
    case QRErrorCorrectLevel.Q:
      return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
    case QRErrorCorrectLevel.H:
      return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
    default:
      return undefined;
  }
};

function QRBitBuffer() {
  this.buffer = [];
  this.length = 0;
}
QRBitBuffer.prototype = {
  get: function(index) {
    let bufIndex = Math.floor(index / 8);
    return ((this.buffer[bufIndex] >>> (7 - index % 8)) & 1) === 1;
  },
  put: function(num, length) {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  },
  getLengthInBits: function() {
    return this.length;
  },
  putBit: function(bit) {
    let bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
    }
    this.length++;
  }
};
let QRCodeLimitLength = [
  [17, 14, 11, 7],
  [32, 26, 20, 14],
  [53, 42, 32, 24],
  [78, 62, 46, 34],
  [106, 84, 60, 44],
  [134, 106, 74, 58],
  [154, 122, 86, 64],
  [192, 152, 108, 84],
  [230, 180, 130, 98],
  [271, 213, 151, 119],
  [321, 251, 177, 137],
  [367, 287, 203, 155],
  [425, 331, 241, 177],
  [458, 362, 258, 194],
  [520, 412, 292, 220],
  [586, 450, 322, 250],
  [644, 504, 364, 280],
  [718, 560, 394, 310],
  [792, 624, 442, 338],
  [858, 666, 482, 382],
  [929, 711, 509, 403],
  [1003, 779, 565, 439],
  [1091, 857, 611, 461],
  [1171, 911, 661, 511],
  [1273, 997, 715, 535],
  [1367, 1059, 751, 593],
  [1465, 1125, 805, 625],
  [1528, 1190, 868, 658],
  [1628, 1264, 908, 698],
  [1732, 1370, 982, 742],
  [1840, 1452, 1030, 790],
  [1952, 1538, 1112, 842],
  [2068, 1628, 1168, 898],
  [2188, 1722, 1228, 958],
  [2303, 1809, 1283, 983],
  [2431, 1911, 1351, 1051],
  [2563, 1989, 1423, 1093],
  [2699, 2099, 1499, 1139],
  [2809, 2213, 1579, 1219],
  [2953, 2331, 1663, 1273]
];

/**
 * Get the type by string length
 * 
 * @private
 * @param {String} sText
 * @param {Number} nCorrectLevel
 * @return {Number} type
 */
function _getTypeNumber(sText, nCorrectLevel) {
  let nType = 1;
  let length = _getUTF8Length(sText);

  for (let i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
    let nLimit = 0;

    switch (nCorrectLevel) {
      case QRErrorCorrectLevel.L:
        nLimit = QRCodeLimitLength[i][0];
        break;
      case QRErrorCorrectLevel.M:
        nLimit = QRCodeLimitLength[i][1];
        break;
      case QRErrorCorrectLevel.Q:
        nLimit = QRCodeLimitLength[i][2];
        break;
      case QRErrorCorrectLevel.H:
        nLimit = QRCodeLimitLength[i][3];
        break;
      default: 
        nLimit = QRCodeLimitLength[i][1];
    }

    if (length <= nLimit) {
      break;
    } else {
      nType++;
    }
  }

  if (nType > QRCodeLimitLength.length) {
    throw new Error("Too long data");
  }

  return nType;
}

function _getUTF8Length(sText) {
  let replacedText = encodeURI(sText)
    .toString()
    .replace(/\%[0-9a-fA-F]{2}/g, 'a');
  return replacedText.length + (replacedText.length !== sText ? 3 : 0);
}

let QRCode = function(str, correctLevel = QRErrorCorrectLevel.H) {
  this.correctLevel = correctLevel;
  if (str) {
    this.makeCode(str);
  }
};

/**
 * Make the QRCode
 * 
 * @param {String} sText link data
 */
QRCode.prototype.makeCode = function(sText) {
  let oQRCode = new QRCodeModel(_getTypeNumber(sText, this.correctLevel),
    this.correctLevel);
  oQRCode.addData(sText);
  oQRCode.make();
  this.size = oQRCode.moduleCount;
  this.data = oQRCode.modules;
};

/**
 * @name QRCode.CorrectLevel
 */
QRCode.CorrectLevel = QRErrorCorrectLevel;

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
    return _.remove(this.functionArr, function (n) {
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
  constructor(list) {
    list = list || ['press', 'tap', 'pressup', 'pan', 'swipe', 'click',
      'mousedown', 'mouseup', 'touchstart', 'touchend', 'touchmove',
      'mousemove'
    ];
    for (let eventItem of list) {
      this[eventItem] = new Signal(eventItem);
    }
  }
}

class FBOEventMapper {
	constructor(fboWorld, mesh, faceIndexArr) {
		this.world = fboWorld;
		this.disable = false;
		this.isDeep = true;
		this.receivers = fboWorld.receivers;
		this.raycaster = new THREE.Raycaster();
		this.mesh = mesh;
		this.faceIndexArr = faceIndexArr || [];
		let normalEventList = fboWorld.app.options.normalEventList;
	}

	dispatch(event, intersect) {
		if (intersect.object === this.mesh) {
			if (this.faceIndexArr && this.faceIndexArr.length === 0) {
				this.raycastCheck(event, intersect);
			} else if (!this.faceIndexArr) {
				this.raycastCheck(event, intersect);
			} else {
				if (this.faceIndexArr.includes(intersect.faceIndex)) {
					this.raycastCheck(event, intersect);
				}
			}
		}
	}

	toNovaEvent(event) {
		return {
			changedPointers: [event],
			center: new THREE.Vector2(event.clientX, event.clientY),
			type: event.type,
			target: event.target
		};
	}

	raycastCheck(event, intersect) {
		let uv = intersect.uv;
		let vec2 = new THREE.Vector2(uv.x * 2 - 1, uv.y * 2 - 1);
		this.raycaster.setFromCamera(vec2, this.world.camera);
		intersect = undefined;

		let intersects = this.raycaster.intersectObjects(this.world.receivers, this.isDeep);
		for (let i = 0; i < intersects.length; i++) {
			if (intersects[i].object.isPenetrated) {
				continue;
			} else {
				intersect = intersects[i];
				break;
			}
		}

		if (intersect && intersect.object.events && intersect.object.events[event
			.type]) {
			intersect.object.events[event.type].run(event, intersect);
		}
		return intersect;
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
    this.css = _.defaultsDeep(css || {}, this.css);
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
    this.css = _.defaultsDeep(css || {}, this.css);
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
    css = _.defaultsDeep(css || {}, {
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
  	this.material.map.dispose();
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
    let texture = new THREE.CanvasTexture(this.canvas);
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
    this.manager = new THREE.LoadingManager();
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

    this.manager.onStart = (url, itemsLoaded, itemsTotal) => {
      if (this.onStart && typeof this.onStart === 'function') {
        this.onStart(url, itemsLoaded, itemsTotal);
      }
    };

    this.manager.onLoad = () => {
      if (this.onLoad && typeof this.onLoad === 'function') {
        this.onLoad();
      }
    };

    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      if (this.onProgress && typeof this.onProgress === 'function') {
        this.onProgress(url, itemsLoaded, itemsTotal);
      }
    };

    this.manager.onError = (url) => {
      if (this.onError && typeof this.onError === 'function') {
        this.onError(url);
      }
    };

    this.imageLoader = new THREE.ImageLoader(this.manager);
    this.textureLoader = new THREE.TextureLoader(this.manager);
    this.audioListener = new THREE.AudioListener(this.manager);
  }

  loadImage(key, src, sucFunc, errFunc) {
    return this.imageLoader.load(src,
      (data) => {
        this.Resource.images[key] = data;
        if (sucFunc) sucFunc(data);
      }, undefined, (err) => {
        this.Resource.unloaded.images.push(src);
        if (errFunc) errFunc(err);
      }
    );
  }

  loadTexture(key, src, sucFunc, errFunc) {
    return this.textureLoader.load(src,
      (data) => {
        this.Resource.textures[key] = data;
        if (sucFunc) sucFunc(data);
      }, undefined, (err) => {
        this.Resource.unloaded.textures.push(src);
        if (errFunc) errFunc(err);
      }
    );
  }
}

let CopyShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'opacity': { value: 1.0 }
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,

  fragmentShader: `
    uniform float opacity;
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D( tDiffuse, vUv );
      gl_FragColor = opacity * texel;
    }`
};

class Pass {
  constructor(effectComposer, renderToScreen = false) {
    // if set to true, the pass is processed by the composer
    this.enabled = true;
    // if set to true, the pass indicates to swap read and write buffer after rendering
    this.needsSwap = true;
    // if set to true, the pass clears its buffer before rendering
    this.clear = false;
    // if set to true, the result of the pass is rendered to screen
    this.renderToScreen = renderToScreen;
    if (effectComposer) {
      effectComposer.addPass(this);
    }
  }
  setSize(width, height) {}
  render(renderer, writeBuffer, readBuffer, delta, maskActive) {}
}

class ShaderPass extends Pass {
  constructor(shader, effectComposer, renderToScreen = false,
    textureID = "tDiffuse") {
    super(effectComposer, renderToScreen);
    this.textureID = textureID;

    if (shader instanceof THREE.ShaderMaterial) {
      this.uniforms = shader.uniforms;
      this.material = shader;
    } else if (shader) {
      this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
      this.material = new THREE.ShaderMaterial({
        defines: shader.defines || {},
        uniforms: this.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader
      });
    }

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene = new THREE.Scene();
    this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
    this.quad.frustumCulled = false;
    this.scene.add(this.quad);
  }

  render(renderer, writeBuffer, readBuffer) {
    if (this.uniforms[this.textureID]) {
      this.uniforms[this.textureID].value = readBuffer.texture;
    }

    this.quad.material = this.material;
    if (this.renderToScreen) {
      renderer.render(this.scene, this.camera);
    } else {
      renderer.render(this.scene, this.camera, writeBuffer, this.clear);
    }
  }
}

class RenderPass extends Pass {
  constructor(scene, camera, overrideMaterial, clearColor, clearAlpha = 0) {
    super();
    this.scene = scene;
    this.camera = camera;
    this.overrideMaterial = overrideMaterial;
    this.clearColor = clearColor;
    this.clearAlpha = clearAlpha;
    this.clear = true;
    this.clearDepth = false;
    this.needsSwap = false;
  }

  render(renderer, writeBuffer, readBuffer, delta, maskActive) {
    let oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    this.scene.overrideMaterial = this.overrideMaterial;
    let oldClearColor, oldClearAlpha;
    if (this.clearColor) {
      oldClearColor = renderer.getClearColor()
        .getHex();
      oldClearAlpha = renderer.getClearAlpha();
      renderer.setClearColor(this.clearColor, this.clearAlpha);
    }
    if (this.clearDepth) {
      renderer.clearDepth();
    }
    renderer.render(this.scene, this.camera, this.renderToScreen ? undefined :
      readBuffer, this.clear);
    if (this.clearColor) {
      renderer.setClearColor(oldClearColor, oldClearAlpha);
    }
    this.scene.overrideMaterial = undefined;
    renderer.autoClear = oldAutoClear;
  }
}

class MaskPass extends Pass {

	constructor(scene, camera) {
		super();
		this.scene = scene;
		this.camera = camera;

		this.clear = true;
		this.needsSwap = false;

		this.inverse = false;
	}

	render(renderer, writeBuffer, readBuffer, delta, maskActive) {
		var context = renderer.context;
		var state = renderer.state;

		// don't update color or depth

		state.buffers.color.setMask(false);
		state.buffers.depth.setMask(false);

		// lock buffers

		state.buffers.color.setLocked(true);
		state.buffers.depth.setLocked(true);

		// set up stencil

		var writeValue, clearValue;

		if (this.inverse) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}

		state.buffers.stencil.setTest(true);
		state.buffers.stencil.setOp(context.REPLACE, context.REPLACE, context.REPLACE);
		state.buffers.stencil.setFunc(context.ALWAYS, writeValue, 0xffffffff);
		state.buffers.stencil.setClear(clearValue);

		// draw into the stencil buffer

		renderer.render(this.scene, this.camera, readBuffer, this.clear);
		renderer.render(this.scene, this.camera, writeBuffer, this.clear);

		// unlock color and depth buffer for subsequent rendering

		state.buffers.color.setLocked(false);
		state.buffers.depth.setLocked(false);

		// only render where stencil is set to 1

		state.buffers.stencil.setFunc(context.EQUAL, 1, 0xffffffff);  // draw if == 1
		state.buffers.stencil.setOp(context.KEEP, context.KEEP, context.KEEP);
	}

}

class ClearMaskPass extends Pass {

	constructor() {
		super();
		this.needsSwap = false;
	}

	render(renderer) {

		renderer.state.buffers.stencil.setTest(false);

	}

}

class EffectComposer {
  constructor(world, options = {}, renderTarget) {
    options = _.defaults(options, {
      renderer: undefined,
      camera: undefined,
      scene: undefined,
      overrideMaterial: undefined,
      clearColor: undefined,
      clearAlpha: 0
    });
    this.renderer = options.renderer || world.app.renderer;
    if (renderTarget === undefined) {
      let parameters = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false
      };
      let size = this.renderer.getDrawingBufferSize();
      renderTarget = new THREE.WebGLRenderTarget(size.width, size.height,
        parameters);
      renderTarget.texture.name = 'EffectComposer.rt1';
    }

    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();
    this.renderTarget2.texture.name = 'EffectComposer.rt2';
    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;

    this.passes = [];
    this.copyPass = new ShaderPass(CopyShader);

    this.addPass(new RenderPass(options.scene || world.scene,
      options.scene || world.camera));
  }

  swapBuffers() {
    let tmp = this.readBuffer;
    this.readBuffer = this.writeBuffer;
    this.writeBuffer = tmp;
  }

  addPass(pass) {
    this.passes.push(pass);
    let size = this.renderer.getDrawingBufferSize();
    pass.setSize(size.width, size.height);
  }

  insertPass(pass, index) {
    this.passes.splice(index, 0, pass);
  }

  render(delta) {
    let maskActive = false;
    let pass, i, il = this.passes.length;
    for (i = 0; i < il; i++) {
      pass = this.passes[i];
      if (pass.enabled === false) continue;
      pass.render(this.renderer, this.writeBuffer, this.readBuffer, delta,
        maskActive);

      if (pass.needsSwap) {
        if (maskActive) {
          let context = this.renderer.context;
          context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);
          this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer,
            delta);
          context.stencilFunc(context.EQUAL, 1, 0xffffffff);
        }
        this.swapBuffers();
      }

      if (MaskPass !== undefined) {
        if (pass instanceof MaskPass) {
          maskActive = true;
        } else if (pass instanceof ClearMaskPass) {
          maskActive = false;
        }
      }
    }
  }

  reset(renderTarget) {
    if (renderTarget === undefined) {
      let size = this.renderer.getDrawingBufferSize();
      renderTarget = this.renderTarget1.clone();
      renderTarget.setSize(size.width, size.height);
    }
    this.renderTarget1.dispose();
    this.renderTarget2.dispose();
    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();
    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;
  }

  setSize(width, height) {
    this.renderTarget1.setSize(width, height);
    this.renderTarget2.setSize(width, height);
    for (let i = 0; i < this.passes.length; i++) {
      this.passes[i].setSize(width, height);
    }
  }
}

let AfterimageShader = {
  uniforms: {
    "damp": { value: 0.96 },
    "tOld": { value: null },
    "tNew": { value: null }
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,

  fragmentShader: `
    uniform sampler2D tOld;
    uniform sampler2D tNew;
    uniform float damp;

    varying vec2 vUv;

    vec4 when_gt( vec4 texel, float y ) {
      return max( sign( texel - y ), 0. );
    }

    void main() {
      vec4 texelOld = texture2D( tOld, vUv );
      vec4 texelNew = texture2D( tNew, vUv );

      texelOld *= damp * when_gt( texelOld, 0.1 );

      gl_FragColor = max( texelNew, texelOld );
    }`
};

class AfterimagePass extends Pass {
  constructor(damp = 0.96, effectComposer, renderToScreen = false) {
    super(effectComposer, renderToScreen);
    this.uniforms = THREE.UniformsUtils.clone(AfterimageShader.uniforms);
    this.uniforms["damp"].value = damp;

    this.textureComp = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat
    });

    this.textureOld = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat
    });

    this.shaderMaterial = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: AfterimageShader.vertexShader,
      fragmentShader: AfterimageShader.fragmentShader
    });

    this.sceneComp = new THREE.Scene();
    this.sceneScreen = new THREE.Scene();

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.camera.position.z = 1;
    var geometry = new THREE.PlaneBufferGeometry(2, 2);

    this.quadComp = new THREE.Mesh(geometry, this.shaderMaterial);
    this.sceneComp.add(this.quadComp);

    let material = new THREE.MeshBasicMaterial({ map: this.textureComp.texture });
    var quadScreen = new THREE.Mesh(geometry, material);
    this.sceneScreen.add(quadScreen);
  }

  render(renderer, writeBuffer, readBuffer, delta, maskActive) {
    this.uniforms["tOld"].value = this.textureOld.texture;
    this.uniforms["tNew"].value = readBuffer.texture;
    this.quadComp.material = this.shaderMaterial;

    renderer.render(this.sceneComp, this.camera, this.textureComp);
    renderer.render(this.sceneScreen, this.camera, this.textureOld);
    if (this.renderToScreen) {
      renderer.render(this.sceneScreen, this.camera);
    } else {
      renderer.render(this.sceneScreen, this.camera, writeBuffer, this.clear);
    }
  }
}

let DotScreenShader = {
  uniforms: {
    "tDiffuse": { value: null },
    "tSize": { value: new THREE.Vector2(256, 256) },
    "center": { value: new THREE.Vector2(0.5, 0.5) },
    "angle": { value: 1.57 },
    "scale": { value: 1.0 }
  },

  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
    "vUv = uv;",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join("\n"),

  fragmentShader: [
    "uniform vec2 center;",
    "uniform float angle;",
    "uniform float scale;",
    "uniform vec2 tSize;",
    "uniform sampler2D tDiffuse;",
    "varying vec2 vUv;",
    "float pattern() {",
    "float s = sin( angle ), c = cos( angle );",
    "vec2 tex = vUv * tSize - center;",
    "vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;",
    "return ( sin( point.x ) * sin( point.y ) ) * 4.0;",
    "}",

    "void main() {",
    "vec4 color = texture2D( tDiffuse, vUv );",
    "float average = ( color.r + color.g + color.b ) / 3.0;",
    "gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );",
    "}"
  ].join("\n")
};

class DotScreenPass extends Pass {
  constructor(center, angle, scale, effectComposer, renderToScreen = false) {
    super(effectComposer, renderToScreen);
    this.uniforms = THREE.UniformsUtils.clone(DotScreenShader.uniforms);
    if (center !== undefined) this.uniforms["center"].value.copy(center);
    if (angle !== undefined) this.uniforms["angle"].value = angle;
    if (scale !== undefined) this.uniforms["scale"].value = scale;

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: DotScreenShader.vertexShader,
      fragmentShader: DotScreenShader.fragmentShader
    });

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene = new THREE.Scene();
    this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
    this.quad.frustumCulled = false; // Avoid getting clipped
    this.scene.add(this.quad);
  }

  render(renderer, writeBuffer, readBuffer, delta, maskActive) {
    this.uniforms["tDiffuse"].value = readBuffer.texture;
    this.uniforms["tSize"].value.set(readBuffer.width, readBuffer.height);

    this.quad.material = this.material;

    if (this.renderToScreen) {
      renderer.render(this.scene, this.camera);
    } else {
      renderer.render(this.scene, this.camera, writeBuffer, this.clear);
    }
  }
}

let GlitchShader = {
  uniforms: {
    "tDiffuse": { value: null }, //diffuse texture
    "tDisp": { value: null }, //displacement texture for digital glitch squares
    "byp": { value: 0 }, //apply the glitch ?
    "amount": { value: 0.08 },
    "angle": { value: 0.02 },
    "seed": { value: 0.02 },
    "seed_x": { value: 0.02 }, //-1,1
    "seed_y": { value: 0.02 }, //-1,1
    "distortion_x": { value: 0.5 },
    "distortion_y": { value: 0.6 },
    "col_s": { value: 0.05 }
  },

  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
    "vUv = uv;",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join("\n"),

  fragmentShader: [
    "uniform int byp;", //should we apply the glitch ?
    "uniform sampler2D tDiffuse;",
    "uniform sampler2D tDisp;",

    "uniform float amount;",
    "uniform float angle;",
    "uniform float seed;",
    "uniform float seed_x;",
    "uniform float seed_y;",
    "uniform float distortion_x;",
    "uniform float distortion_y;",
    "uniform float col_s;",

    "varying vec2 vUv;",

    "float rand(vec2 co){",
    "return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
    "}",

    "void main() {",
    "if(byp<1) {",
    "vec2 p = vUv;",
    "float xs = floor(gl_FragCoord.x / 0.5);",
    "float ys = floor(gl_FragCoord.y / 0.5);",
    //based on staffantans glitch shader for unity https://github.com/staffantan/unityglitch
    "vec4 normal = texture2D (tDisp, p*seed*seed);",
    "if(p.y<distortion_x+col_s && p.y>distortion_x-col_s*seed) {",
    "if(seed_x>0.){",
    "p.y = 1. - (p.y + distortion_y);",
    "}",
    "else {",
    "p.y = distortion_y;",
    "}",
    "}",
    "if(p.x<distortion_y+col_s && p.x>distortion_y-col_s*seed) {",
    "if(seed_y>0.){",
    "p.x=distortion_x;",
    "}",
    "else {",
    "p.x = 1. - (p.x + distortion_x);",
    "}",
    "}",
    "p.x+=normal.x*seed_x*(seed/5.);",
    "p.y+=normal.y*seed_y*(seed/5.);",
    //base from RGB shift shader
    "vec2 offset = amount * vec2( cos(angle), sin(angle));",
    "vec4 cr = texture2D(tDiffuse, p + offset);",
    "vec4 cga = texture2D(tDiffuse, p);",
    "vec4 cb = texture2D(tDiffuse, p - offset);",
    "gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);",
    //add noise
    "vec4 snow = 200.*amount*vec4(rand(vec2(xs * seed,ys * seed*50.))*0.2);",
    "gl_FragColor = gl_FragColor+ snow;",
    "}",
    "else {",
    "gl_FragColor=texture2D (tDiffuse, vUv);",
    "}",
    "}"
  ].join("\n")
};

class GlitchPass extends Pass {
  constructor(size = 64, goWild = false, effectComposer, renderToScreen = false) {
    super(effectComposer, renderToScreen);
    this.uniforms = THREE.UniformsUtils.clone(GlitchShader.uniforms);
    this.uniforms["tDisp"].value = this.generateHeightmap(size);

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: GlitchShader.vertexShader,
      fragmentShader: GlitchShader.fragmentShader
    });

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene = new THREE.Scene();

    this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
    this.quad.frustumCulled = false;
    this.scene.add(this.quad);

    this.goWild = false;
    this.curF = 0;
    this.generateTrigger();
  }

  render(renderer, writeBuffer, readBuffer, delta, maskActive) {
    this.uniforms["tDiffuse"].value = readBuffer.texture;
    this.uniforms['seed'].value = Math.random();
    this.uniforms['byp'].value = 0;

    if (this.curF % this.randX === 0 || this.goWild === true) {
      this.uniforms['amount'].value = Math.random() / 30;
      this.uniforms['angle'].value = THREE.Math.randFloat(-Math.PI, Math.PI);
      this.uniforms['seed_x'].value = THREE.Math.randFloat(-1, 1);
      this.uniforms['seed_y'].value = THREE.Math.randFloat(-1, 1);
      this.uniforms['distortion_x'].value = THREE.Math.randFloat(0, 1);
      this.uniforms['distortion_y'].value = THREE.Math.randFloat(0, 1);
      this.curF = 0;
      this.generateTrigger();
    } else if (this.curF % this.randX < this.randX / 5) {
      this.uniforms['amount'].value = Math.random() / 90;
      this.uniforms['angle'].value = THREE.Math.randFloat(-Math.PI, Math.PI);
      this.uniforms['distortion_x'].value = THREE.Math.randFloat(0, 1);
      this.uniforms['distortion_y'].value = THREE.Math.randFloat(0, 1);
      this.uniforms['seed_x'].value = THREE.Math.randFloat(-0.3, 0.3);
      this.uniforms['seed_y'].value = THREE.Math.randFloat(-0.3, 0.3);
    } else if (this.goWild === false) {
      this.uniforms['byp'].value = 1;
    }

    this.curF++;
    this.quad.material = this.material;

    if (this.renderToScreen) {
      renderer.render(this.scene, this.camera);
    } else {
      renderer.render(this.scene, this.camera, writeBuffer, this.clear);
    }
  }

  generateTrigger() {
    this.randX = THREE.Math.randInt(120, 240);
  }

  generateHeightmap(size) {
    let dataArr = new Float32Array(size * size * 3);
    let length = size * size;

    for (let i = 0; i < length; i++) {
      let val = THREE.Math.randFloat(0, 1);
      dataArr[i * 3 + 0] = val;
      dataArr[i * 3 + 1] = val;
      dataArr[i * 3 + 2] = val;
    }

    let texture = new THREE.DataTexture(dataArr, size, size,
      THREE.RGBFormat, THREE.FloatType);
    texture.needsUpdate = true;
    return texture;
  }
}

class OutlinePass extends Pass {
  constructor(resolution, world, selectedObjects = [], effectComposer) {
    super(undefined, false);
    this.BlurDirectionX = new THREE.Vector2(1.0, 0.0);
    this.BlurDirectionY = new THREE.Vector2(0.0, 1.0);
    this.renderScene = world.scene;
    this.renderCamera = world.camera;
    this.selectedObjects = selectedObjects;
    this.visibleEdgeColor = new THREE.Color(1, 1, 1);
    this.hiddenEdgeColor = new THREE.Color(0.1, 0.04, 0.02);
    this.edgeGlow = 0.0;
    this.usePatternTexture = false;
    this.edgeThickness = 1.0;
    this.edgeStrength = 3.0;
    this.downSampleRatio = 2;
    this.pulsePeriod = 0;

    this.resolution = (resolution !== undefined) ? new THREE.Vector2(
      resolution.x, resolution.y) : new THREE.Vector2(256, 256);

    let pars = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    };

    let resx = Math.round(this.resolution.x / this.downSampleRatio);
    let resy = Math.round(this.resolution.y / this.downSampleRatio);

    this.maskBufferMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.maskBufferMaterial.side = THREE.DoubleSide;
    this.renderTargetMaskBuffer = new THREE.WebGLRenderTarget(
    	this.resolution.x, this.resolution.y, pars);
    this.renderTargetMaskBuffer.texture.name = "OutlinePass.mask";
    this.renderTargetMaskBuffer.texture.generateMipmaps = false;

    this.depthMaterial = new THREE.MeshDepthMaterial();
    this.depthMaterial.side = THREE.DoubleSide;
    this.depthMaterial.depthPacking = THREE.RGBADepthPacking;
    this.depthMaterial.blending = THREE.NoBlending;

    this.prepareMaskMaterial = this.getPrepareMaskMaterial();
    this.prepareMaskMaterial.side = THREE.DoubleSide;
    this.prepareMaskMaterial.fragmentShader = replaceDepthToViewZ(this.prepareMaskMaterial
      .fragmentShader, this.renderCamera);

    this.renderTargetDepthBuffer = new THREE.WebGLRenderTarget(this.resolution
      .x,
      this.resolution.y, pars);
    this.renderTargetDepthBuffer.texture.name = "OutlinePass.depth";
    this.renderTargetDepthBuffer.texture.generateMipmaps = false;

    this.renderTargetMaskDownSampleBuffer = new THREE.WebGLRenderTarget(resx,
      resy, pars);
    this.renderTargetMaskDownSampleBuffer.texture.name =
      "OutlinePass.depthDownSample";
    this.renderTargetMaskDownSampleBuffer.texture.generateMipmaps = false;

    this.renderTargetBlurBuffer1 = new THREE.WebGLRenderTarget(resx, resy,
      pars);
    this.renderTargetBlurBuffer1.texture.name = "OutlinePass.blur1";
    this.renderTargetBlurBuffer1.texture.generateMipmaps = false;
    this.renderTargetBlurBuffer2 = new THREE.WebGLRenderTarget(Math.round(
      resx /
      2), Math.round(resy / 2), pars);
    this.renderTargetBlurBuffer2.texture.name = "OutlinePass.blur2";
    this.renderTargetBlurBuffer2.texture.generateMipmaps = false;

    this.edgeDetectionMaterial = this.getEdgeDetectionMaterial();
    this.renderTargetEdgeBuffer1 = new THREE.WebGLRenderTarget(resx, resy,
      pars);
    this.renderTargetEdgeBuffer1.texture.name = "OutlinePass.edge1";
    this.renderTargetEdgeBuffer1.texture.generateMipmaps = false;
    this.renderTargetEdgeBuffer2 = new THREE.WebGLRenderTarget(Math.round(
      resx /
      2), Math.round(resy / 2), pars);
    this.renderTargetEdgeBuffer2.texture.name = "OutlinePass.edge2";
    this.renderTargetEdgeBuffer2.texture.generateMipmaps = false;

    let MAX_EDGE_THICKNESS = 4;
    let MAX_EDGE_GLOW = 4;

    this.separableBlurMaterial1 = this.getSeperableBlurMaterial(
      MAX_EDGE_THICKNESS);
    this.separableBlurMaterial1.uniforms["texSize"].value = new THREE.Vector2(
      resx, resy);
    this.separableBlurMaterial1.uniforms["kernelRadius"].value = 1;
    this.separableBlurMaterial2 = this.getSeperableBlurMaterial(MAX_EDGE_GLOW);
    this.separableBlurMaterial2.uniforms["texSize"].value = new THREE.Vector2(
      Math.round(resx / 2), Math.round(resy / 2));
    this.separableBlurMaterial2.uniforms["kernelRadius"].value =
      MAX_EDGE_GLOW;

    // Overlay material
    this.overlayMaterial = this.getOverlayMaterial();

    this.copyUniforms = THREE.UniformsUtils.clone(CopyShader.uniforms);
    this.copyUniforms["opacity"].value = 1.0;

    this.materialCopy = new THREE.ShaderMaterial({
      uniforms: this.copyUniforms,
      vertexShader: CopyShader.vertexShader,
      fragmentShader: CopyShader.fragmentShader,
      blending: THREE.NoBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true
    });

    this.enabled = true;
    this.needsSwap = false;

    this.oldClearColor = new THREE.Color();
    this.oldClearAlpha = 1;

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene = new THREE.Scene();

    this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
    this.quad.frustumCulled = false; // Avoid getting clipped
    this.scene.add(this.quad);

    this.tempPulseColor1 = new THREE.Color();
    this.tempPulseColor2 = new THREE.Color();
    this.textureMatrix = new THREE.Matrix4();

    function replaceDepthToViewZ(string, camera) {
      let type = camera.isPerspectiveCamera ? 'perspective' : 'orthographic';
      return string.replace(/DEPTH_TO_VIEW_Z/g, type + 'DepthToViewZ');
    }

    if (effectComposer) {
      effectComposer.addPass(this);
    }
  }

  dispose() {
    this.renderTargetMaskBuffer.dispose();
    this.renderTargetDepthBuffer.dispose();
    this.renderTargetMaskDownSampleBuffer.dispose();
    this.renderTargetBlurBuffer1.dispose();
    this.renderTargetBlurBuffer2.dispose();
    this.renderTargetEdgeBuffer1.dispose();
    this.renderTargetEdgeBuffer2.dispose();
  }

  setSize(width, height) {
    this.renderTargetMaskBuffer.setSize(width, height);

    let resx = Math.round(width / this.downSampleRatio);
    let resy = Math.round(height / this.downSampleRatio);
    this.renderTargetMaskDownSampleBuffer.setSize(resx, resy);
    this.renderTargetBlurBuffer1.setSize(resx, resy);
    this.renderTargetEdgeBuffer1.setSize(resx, resy);
    this.separableBlurMaterial1.uniforms["texSize"].value = new THREE.Vector2(
      resx, resy);

    resx = Math.round(resx / 2);
    resy = Math.round(resy / 2);

    this.renderTargetBlurBuffer2.setSize(resx, resy);
    this.renderTargetEdgeBuffer2.setSize(resx, resy);

    this.separableBlurMaterial2.uniforms["texSize"].value = new THREE.Vector2(
      resx, resy);
  }

  changeVisibilityOfSelectedObjects(bVisible) {
    function gatherSelectedMeshesCallBack(object) {
      if (object instanceof THREE.Mesh) object.visible = bVisible;
    }

    for (let i = 0; i < this.selectedObjects.length; i++) {
      let selectedObject = this.selectedObjects[i];
      selectedObject.traverse(gatherSelectedMeshesCallBack);
    }
  }

  changeVisibilityOfNonSelectedObjects(bVisible) {
    let selectedMeshes = [];

    function gatherSelectedMeshesCallBack(object) {
      if (object instanceof THREE.Mesh) selectedMeshes.push(object);
    }

    for (let i = 0; i < this.selectedObjects.length; i++) {
      let selectedObject = this.selectedObjects[i];
      selectedObject.traverse(gatherSelectedMeshesCallBack);
    }

    function VisibilityChangeCallBack(object) {
      if (object instanceof THREE.Mesh || object instanceof THREE.Line ||
        object instanceof THREE.Sprite) {

        let bFound = false;

        for (let i = 0; i < selectedMeshes.length; i++) {
          let selectedObjectId = selectedMeshes[i].id;
          if (selectedObjectId === object.id) {
            bFound = true;
            break;
          }
        }

        if (!bFound) {
          let visibility = object.visible;
          if (!bVisible || object.bVisible) object.visible = bVisible;
          object.bVisible = visibility;
        }
      }
    }

    this.renderScene.traverse(VisibilityChangeCallBack);
  }

  updateTextureMatrix() {
    this.textureMatrix.set(0.5, 0.0, 0.0, 0.5,
      0.0, 0.5, 0.0, 0.5,
      0.0, 0.0, 0.5, 0.5,
      0.0, 0.0, 0.0, 1.0);
    this.textureMatrix.multiply(this.renderCamera.projectionMatrix);
    this.textureMatrix.multiply(this.renderCamera.matrixWorldInverse);
  }

  render(renderer, writeBuffer, readBuffer, delta, maskActive) {

    if (this.selectedObjects.length === 0) return;

    this.oldClearColor.copy(renderer.getClearColor());
    this.oldClearAlpha = renderer.getClearAlpha();
    let oldAutoClear = renderer.autoClear;

    renderer.autoClear = false;

    if (maskActive) renderer.context.disable(renderer.context.STENCIL_TEST);

    renderer.setClearColor(0xffffff, 1);

    // Make selected objects invisible
    this.changeVisibilityOfSelectedObjects(false);

    let currentBackground = this.renderScene.background;
    this.renderScene.background = null;

    // 1. Draw Non Selected objects in the depth buffer
    this.renderScene.overrideMaterial = this.depthMaterial;
    renderer.render(this.renderScene, this.renderCamera, this.renderTargetDepthBuffer,
      true);

    // Make selected objects visible
    this.changeVisibilityOfSelectedObjects(true);

    // Update Texture Matrix for Depth compare
    this.updateTextureMatrix();

    // Make non selected objects invisible, and draw only the selected objects, by comparing the depth buffer of non selected objects
    this.changeVisibilityOfNonSelectedObjects(false);
    this.renderScene.overrideMaterial = this.prepareMaskMaterial;
    this.prepareMaskMaterial.uniforms["cameraNearFar"].value = new THREE.Vector2(
      this.renderCamera.near, this.renderCamera.far);
    this.prepareMaskMaterial.uniforms["depthTexture"].value = this.renderTargetDepthBuffer
      .texture;
    this.prepareMaskMaterial.uniforms["textureMatrix"].value = this.textureMatrix;
    renderer.render(this.renderScene, this.renderCamera, this.renderTargetMaskBuffer,
      true);
    this.renderScene.overrideMaterial = null;
    this.changeVisibilityOfNonSelectedObjects(true);

    this.renderScene.background = currentBackground;

    // 2. Downsample to Half resolution
    this.quad.material = this.materialCopy;
    this.copyUniforms["tDiffuse"].value = this.renderTargetMaskBuffer.texture;
    renderer.render(this.scene, this.camera, this.renderTargetMaskDownSampleBuffer,
      true);

    this.tempPulseColor1.copy(this.visibleEdgeColor);
    this.tempPulseColor2.copy(this.hiddenEdgeColor);

    if (this.pulsePeriod > 0) {
      let scalar = (1 + 0.25) / 2 + Math.cos(performance.now() * 0.01 /
        this.pulsePeriod) * (1.0 - 0.25) / 2;
      this.tempPulseColor1.multiplyScalar(scalar);
      this.tempPulseColor2.multiplyScalar(scalar);

    }

    // 3. Apply Edge Detection Pass
    this.quad.material = this.edgeDetectionMaterial;
    this.edgeDetectionMaterial.uniforms["maskTexture"].value = this.renderTargetMaskDownSampleBuffer
      .texture;
    this.edgeDetectionMaterial.uniforms["texSize"].value = new THREE.Vector2(
      this.renderTargetMaskDownSampleBuffer.width, this.renderTargetMaskDownSampleBuffer
      .height);
    this.edgeDetectionMaterial.uniforms["visibleEdgeColor"].value = this.tempPulseColor1;
    this.edgeDetectionMaterial.uniforms["hiddenEdgeColor"].value = this.tempPulseColor2;
    renderer.render(this.scene, this.camera, this.renderTargetEdgeBuffer1,
      true);

    // 4. Apply Blur on Half res
    this.quad.material = this.separableBlurMaterial1;
    this.separableBlurMaterial1.uniforms["colorTexture"].value = this.renderTargetEdgeBuffer1
      .texture;
    this.separableBlurMaterial1.uniforms["direction"].value = this.BlurDirectionX;
    this.separableBlurMaterial1.uniforms["kernelRadius"].value = this.edgeThickness;
    renderer.render(this.scene, this.camera, this.renderTargetBlurBuffer1,
      true);
    this.separableBlurMaterial1.uniforms["colorTexture"].value = this.renderTargetBlurBuffer1
      .texture;
    this.separableBlurMaterial1.uniforms["direction"].value = this
      .BlurDirectionY;
    renderer.render(this.scene, this.camera, this.renderTargetEdgeBuffer1,
      true);

    // Apply Blur on quarter res
    this.quad.material = this.separableBlurMaterial2;
    this.separableBlurMaterial2.uniforms["colorTexture"].value = this.renderTargetEdgeBuffer1.texture;
    this.separableBlurMaterial2.uniforms["direction"].value = this.BlurDirectionX;
    renderer.render(this.scene, this.camera, this.renderTargetBlurBuffer2, true);
    this.separableBlurMaterial2.uniforms["colorTexture"].value = this.renderTargetBlurBuffer2.texture;
    this.separableBlurMaterial2.uniforms["direction"].value = this.BlurDirectionY;
    renderer.render(this.scene, this.camera, this.renderTargetEdgeBuffer2, true);

    // Blend it additively over the input texture
    this.quad.material = this.overlayMaterial;
    this.overlayMaterial.uniforms["maskTexture"].value = this.renderTargetMaskBuffer
      .texture;
    this.overlayMaterial.uniforms["edgeTexture1"].value = this.renderTargetEdgeBuffer1
      .texture;
    this.overlayMaterial.uniforms["edgeTexture2"].value = this.renderTargetEdgeBuffer2
      .texture;
    this.overlayMaterial.uniforms["patternTexture"].value = this.patternTexture;
    this.overlayMaterial.uniforms["edgeStrength"].value = this.edgeStrength;
    this.overlayMaterial.uniforms["edgeGlow"].value = this.edgeGlow;
    this.overlayMaterial.uniforms["usePatternTexture"].value = this.usePatternTexture;

    if (maskActive) renderer.context.enable(renderer.context.STENCIL_TEST);

    renderer.render(this.scene, this.camera, readBuffer, false);

    renderer.setClearColor(this.oldClearColor, this.oldClearAlpha);
    renderer.autoClear = oldAutoClear;

  }

  getPrepareMaskMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        "depthTexture": { value: null },
        "cameraNearFar": { value: new THREE.Vector2(0.5, 0.5) },
        "textureMatrix": { value: new THREE.Matrix4() }
      },

      vertexShader: [
        'varying vec4 projTexCoord;',
        'varying vec4 vPosition;',
        'uniform mat4 textureMatrix;',

        'void main() {',

        '	vPosition = modelViewMatrix * vec4( position, 1.0 );',
        '	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
        '	projTexCoord = textureMatrix * worldPosition;',
        '	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

        '}'
      ].join('\n'),

      fragmentShader: [
        '#include <packing>',
        'varying vec4 vPosition;',
        'varying vec4 projTexCoord;',
        'uniform sampler2D depthTexture;',
        'uniform vec2 cameraNearFar;',

        'void main() {',

        '	float depth = unpackRGBAToDepth(texture2DProj( depthTexture, projTexCoord ));',
        '	float viewZ = - DEPTH_TO_VIEW_Z( depth, cameraNearFar.x, cameraNearFar.y );',
        '	float depthTest = (-vPosition.z > viewZ) ? 1.0 : 0.0;',
        '	gl_FragColor = vec4(0.0, depthTest, 1.0, 1.0);',

        '}'
      ].join('\n')
    });
  }

  getEdgeDetectionMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        "maskTexture": { value: null },
        "texSize": { value: new THREE.Vector2(0.5, 0.5) },
        "visibleEdgeColor": { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        "hiddenEdgeColor": { value: new THREE.Vector3(1.0, 1.0, 1.0) },
      },

      vertexShader: `varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,

      fragmentShader: `varying vec2 vUv;
				uniform sampler2D maskTexture;
				uniform vec2 texSize;
				uniform vec3 visibleEdgeColor;
				uniform vec3 hiddenEdgeColor;

				void main() {
					vec2 invSize = 1.0 / texSize;
					vec4 uvOffset = vec4(1.0, 0.0, 0.0, 1.0) * vec4(invSize, invSize);
					vec4 c1 = texture2D( maskTexture, vUv + uvOffset.xy);
					vec4 c2 = texture2D( maskTexture, vUv - uvOffset.xy);
					vec4 c3 = texture2D( maskTexture, vUv + uvOffset.yw);
					vec4 c4 = texture2D( maskTexture, vUv - uvOffset.yw);
					float diff1 = (c1.r - c2.r)*0.5;
					float diff2 = (c3.r - c4.r)*0.5;
					float d = length( vec2(diff1, diff2) );
					float a1 = min(c1.g, c2.g);
					float a2 = min(c3.g, c4.g);
					float visibilityFactor = min(a1, a2);
					vec3 edgeColor = 1.0 - visibilityFactor > 0.001 ? visibleEdgeColor : hiddenEdgeColor;
					gl_FragColor = vec4(edgeColor, 1.0) * vec4(d);
				}`
    });
  }

  getSeperableBlurMaterial(maxRadius) {
    return new THREE.ShaderMaterial({
      defines: {
        "MAX_RADIUS": maxRadius,
      },

      uniforms: {
        "colorTexture": { value: null },
        "texSize": { value: new THREE.Vector2(0.5, 0.5) },
        "direction": { value: new THREE.Vector2(0.5, 0.5) },
        "kernelRadius": { value: 1.0 }
      },

      vertexShader: `varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,

      fragmentShader: `#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 texSize;
				uniform vec2 direction;
				uniform float kernelRadius;

				float gaussianPdf(in float x, in float sigma) {
					return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;
				}
				void main() {
					vec2 invSize = 1.0 / texSize;
					float weightSum = gaussianPdf(0.0, kernelRadius);
					vec3 diffuseSum = texture2D( colorTexture, vUv).rgb * weightSum;
					vec2 delta = direction * invSize * kernelRadius/float(MAX_RADIUS);
					vec2 uvOffset = delta;
					for( int i = 1; i <= MAX_RADIUS; i ++ ) {
						float w = gaussianPdf(uvOffset.x, kernelRadius);
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset).rgb;
						diffuseSum += ((sample1 + sample2) * w);
						weightSum += (2.0 * w);
						uvOffset += delta;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`
    });
  }

  getOverlayMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        "maskTexture": { value: null },
        "edgeTexture1": { value: null },
        "edgeTexture2": { value: null },
        "patternTexture": { value: null },
        "edgeStrength": { value: 1.0 },
        "edgeGlow": { value: 1.0 },
        "usePatternTexture": { value: 0.0 }
      },

      vertexShader: `varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,

      fragmentShader: `varying vec2 vUv;
				uniform sampler2D maskTexture;
				uniform sampler2D edgeTexture1;
				uniform sampler2D edgeTexture2;
				uniform sampler2D patternTexture;
				uniform float edgeStrength;
				uniform float edgeGlow;
				uniform bool usePatternTexture;

				void main() {
					vec4 edgeValue1 = texture2D(edgeTexture1, vUv);
					vec4 edgeValue2 = texture2D(edgeTexture2, vUv);
					vec4 maskColor = texture2D(maskTexture, vUv);
					vec4 patternColor = texture2D(patternTexture, 6.0 * vUv);
					float visibilityFactor = 1.0 - maskColor.g > 0.0 ? 1.0 : 0.5;
					vec4 edgeValue = edgeValue1 + edgeValue2 * edgeGlow;
					vec4 finalColor = edgeStrength * maskColor.r * edgeValue;
					if(usePatternTexture)
						finalColor += + visibilityFactor * (1.0 - maskColor.r) * (1.0 - patternColor.r);
					gl_FragColor = finalColor;
				}`,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true
    });
  }
}

/**
 * @author mattatz / http://mattatz.github.io
 *
 * Based on 
 * Charlotte Hoare MSc Project / http://nccastaff.bournemouth.ac.uk/jmacey/MastersProjects/MSc12/Hoare/index.html
 * and 
 * Su et al. Real-Time rendering of watercolor effects for virtual environments. / http://dl.acm.org/citation.cfm?id=2131253
 */

let WatercolorShader = {

	uniforms: {
		"tDiffuse": { type: "t", value: null }, // diffuse texture
		"tPaper": { type: "t", value: null }, // paper texture
		"texel": { type: "v2", value: new THREE.Vector2( 1.0 / 512, 1.0 / 512 ) },
		"scale": { type: "f", value: 0.03 }, // wobble scale
		"threshold": { type: "f", value: 0.7 }, // edge threshold
		"darkening": { type: "f", value: 1.75 }, // edge darkening
		"pigment": { type: "f", value: 1.2 }, // pigment dispersion
	},

	vertexShader: [
		"varying vec2 vUv;",
		"void main() {",
		"vUv = uv;",
		"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
	].join( "\n" ),

	fragmentShader: [
		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tPaper;",

		"uniform vec2 texel;",
		"uniform float scale;",
		"uniform float threshold;",
		"uniform float darkening;",
		"uniform float pigment;",

		"varying vec2 vUv;",

		"float sobel(sampler2D tex, vec2 uv) {",

		"vec3 hr = vec3(0., 0., 0.);",
		"hr += texture2D(tex, (uv + vec2(-1.0, -1.0) * texel)).rgb *  1.0;",
		"hr += texture2D(tex, (uv + vec2( 0.0, -1.0) * texel)).rgb *  0.0;",
		"hr += texture2D(tex, (uv + vec2( 1.0, -1.0) * texel)).rgb * -1.0;",
		"hr += texture2D(tex, (uv + vec2(-1.0,  0.0) * texel)).rgb *  2.0;",
		"hr += texture2D(tex, (uv + vec2( 0.0,  0.0) * texel)).rgb *  0.0;",
		"hr += texture2D(tex, (uv + vec2( 1.0,  0.0) * texel)).rgb * -2.0;",
		"hr += texture2D(tex, (uv + vec2(-1.0,  1.0) * texel)).rgb *  1.0;",
		"hr += texture2D(tex, (uv + vec2( 0.0,  1.0) * texel)).rgb *  0.0;",
		"hr += texture2D(tex, (uv + vec2( 1.0,  1.0) * texel)).rgb * -1.0;",

		"vec3 vt = vec3(0., 0., 0.);",
		"vt += texture2D(tex, (uv + vec2(-1.0, -1.0) * texel)).rgb *  1.0;",
		"vt += texture2D(tex, (uv + vec2( 0.0, -1.0) * texel)).rgb *  2.0;",
		"vt += texture2D(tex, (uv + vec2( 1.0, -1.0) * texel)).rgb *  1.0;",
		"vt += texture2D(tex, (uv + vec2(-1.0,  0.0) * texel)).rgb *  0.0;",
		"vt += texture2D(tex, (uv + vec2( 0.0,  0.0) * texel)).rgb *  0.0;",
		"vt += texture2D(tex, (uv + vec2( 1.0,  0.0) * texel)).rgb *  0.0;",
		"vt += texture2D(tex, (uv + vec2(-1.0,  1.0) * texel)).rgb * -1.0;",
		"vt += texture2D(tex, (uv + vec2( 0.0,  1.0) * texel)).rgb * -2.0;",
		"vt += texture2D(tex, (uv + vec2( 1.0,  1.0) * texel)).rgb * -1.0;",

		"return sqrt(dot(hr, hr) + dot(vt, vt));",
		"}",

		"vec2 wobble(sampler2D tex, vec2 uv) {",
		"return uv + (texture2D(tex, uv).xy - 0.5) * scale;",
		"}",

		"vec4 edgeDarkening(sampler2D tex, vec2 uv) {",
		"vec4 c = texture2D(tex, uv);",
		"return c * (1.0 - (1.0 - c) * (darkening - 1.0));",
		"}",

		"float granulation(sampler2D tex, vec2 uv, float beta) {",
		"vec4 c = texture2D(tex, uv);",
		"float intensity = (c.r + c.g + c.b) / 3.0;",
		"return 1.0 + beta * (intensity - 0.5);",
		"}",

		"void main() {",
		"vec2 uv = vUv;",
		"uv = wobble(tPaper, uv);",

		"float pd = granulation(tPaper, vUv, pigment);", // pigment dispersion

		"float edge = sobel(tDiffuse, uv);",
		"if (edge > threshold) {",
		"gl_FragColor = pd * edgeDarkening(tDiffuse, uv);",
		"} else {",
		"gl_FragColor = pd * texture2D(tDiffuse, uv);",
		"}",
		"}"

	].join( "\n" )

};

/**
 * @author mattatz / http://mattatz.github.io
 */
class WatercolorPass extends Pass {
	constructor( tPaper, effectComposer, renderToScreen ) {
		super( effectComposer, renderToScreen );
		let shader = WatercolorShader;
		this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

		tPaper.wrapS = tPaper.wrapT = THREE.RepeatWrapping;
		this.uniforms[ "tPaper" ].value = tPaper;

		this.material = new THREE.ShaderMaterial( {
			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader
		} );

		this.enabled = true;
		this.renderToScreen = renderToScreen;
		this.needsSwap = true;

		this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
		this.scene = new THREE.Scene();

		this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
		this.scene.add( this.quad );
	}

	render( renderer, writeBuffer, readBuffer, delta, maskActive ) {
		this.uniforms[ "tDiffuse" ].value = readBuffer;
		this.uniforms[ "texel" ].value = new THREE.Vector2( 1.0 / readBuffer.width,
			1.0 / readBuffer.height );

		this.quad.material = this.material;
		if ( this.renderToScreen ) {
			renderer.render( this.scene, this.camera );
		} else {
			renderer.render( this.scene, this.camera, writeBuffer, false );
		}
	}
}

let TestShader = {
	uniforms: {
		"tDiffuse": { value: null },
		"tSize": { value: new THREE.Vector2( 256, 256 ) },
		"center": { value: new THREE.Vector2( 0.5, 0.5 ) },
		"angle": { value: 1.57 },
		"scale": { value: 1.0 }
	},

	vertexShader: [
		"varying vec2 vUv;",
		"void main() {",
		"vUv = uv;",
		"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
	].join( "\n" ),

	fragmentShader: [
		`uniform vec2 center;
    uniform float angle;
    uniform float scale;
    uniform vec2 tSize;
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    float pattern() {
      float s = sin( angle ), c = cos( angle );
      vec2 tex = vUv * tSize - center;
      vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;
      return ( sin( point.x ) * sin( point.y ) ) * 4.0;
    }

const float PI = 3.1415926536;
const float PI2 = PI * 2.0; 
const int mSize = 9;
const int kSize = (mSize-1)/2;
const float sigma = 3.0;
float kernel[mSize];

float normpdf(in float x, in float sigma) 
{
	return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;
}

vec3 colorDodge(in vec3 src, in vec3 dst)
{
    return step(0.0, dst) * mix(min(vec3(1.0), dst/ (1.0 - src)), vec3(1.0), step(1.0, src)); 
}

float greyScale(in vec3 col) 
{
    return dot(col, vec3(0.3, 0.59, 0.11));
    //return dot(col, vec3(0.2126, 0.7152, 0.0722)); //sRGB
}

vec2 random(vec2 p){
	p = fract(p * vec2(443.897, 441.423));
    p += dot(p, p.yx+19.19);
    return fract((p.xx+p.yx)*p.xy);
}


    void main() {
    	vec2 q = -1.0 + 2.0 *vUv;
      vec4 color = texture2D( tDiffuse, vUv );
      vec3 col = color.rgb;
      
      vec2 r = random(q);
      r.x *= PI2;
      vec2 cr = vec2(sin(r.x),cos(r.x))*sqrt(r.y);
    
      vec3 blurred = color.rgb;
    
    
    vec3 inv = vec3(1.0) - blurred; 
    // color dodge
    vec3 lighten = colorDodge(col, inv);
    // grey scale
    vec3 res = vec3(greyScale(lighten));
    
    // more contrast
    res = vec3(pow(res.x, 3.0)); 
      
      
      gl_FragColor = vec4( res,1.0 );
    }`
	].join( "\n" )
};

class TestPass extends Pass {
  constructor(center, angle, scale, effectComposer, renderToScreen = false) {
    super(effectComposer, renderToScreen);
    this.uniforms = THREE.UniformsUtils.clone(TestShader.uniforms);
    if (center !== undefined) this.uniforms["center"].value.copy(center);
    if (angle !== undefined) this.uniforms["angle"].value = angle;
    if (scale !== undefined) this.uniforms["scale"].value = scale;

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: TestShader.vertexShader,
      fragmentShader: TestShader.fragmentShader
    });

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene = new THREE.Scene();
    this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
    this.quad.frustumCulled = false; // Avoid getting clipped
    this.scene.add(this.quad);
  }

  render(renderer, writeBuffer, readBuffer, delta, maskActive) {
    this.uniforms["tDiffuse"].value = readBuffer.texture;
    this.uniforms["tSize"].value.set(readBuffer.width, readBuffer.height);

    this.quad.material = this.material;

    if (this.renderToScreen) {
      renderer.render(this.scene, this.camera);
    } else {
      renderer.render(this.scene, this.camera, writeBuffer, this.clear);
    }
  }
}

/**
 * @author alteredq / http://alteredqualia.com/
 * @author davidedc / http://www.sketchpatch.net/
 *
 * NVIDIA FXAA by Timothy Lottes
 * http://timothylottes.blogspot.com/2011/06/fxaa3-source-released.html
 * - WebGL port by @supereggbert
 * http://www.glge.org/demos/fxaa/
 */

let FXAAShader = {

	uniforms: {

		"tDiffuse":   { value: null },
		"resolution": { value: new THREE.Vector2( 1 / 1024, 1 / 512 ) }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [
        "precision highp float;",
        "",
        "uniform sampler2D tDiffuse;",
        "",
        "uniform vec2 resolution;",
        "",
        "varying vec2 vUv;",
        "",
        "// FXAA 3.11 implementation by NVIDIA, ported to WebGL by Agost Biro (biro@archilogic.com)",
        "",
        "//----------------------------------------------------------------------------------",
        "// File:        es3-kepler\FXAA\assets\shaders/FXAA_DefaultES.frag",
        "// SDK Version: v3.00",
        "// Email:       gameworks@nvidia.com",
        "// Site:        http://developer.nvidia.com/",
        "//",
        "// Copyright (c) 2014-2015, NVIDIA CORPORATION. All rights reserved.",
        "//",
        "// Redistribution and use in source and binary forms, with or without",
        "// modification, are permitted provided that the following conditions",
        "// are met:",
        "//  * Redistributions of source code must retain the above copyright",
        "//    notice, this list of conditions and the following disclaimer.",
        "//  * Redistributions in binary form must reproduce the above copyright",
        "//    notice, this list of conditions and the following disclaimer in the",
        "//    documentation and/or other materials provided with the distribution.",
        "//  * Neither the name of NVIDIA CORPORATION nor the names of its",
        "//    contributors may be used to endorse or promote products derived",
        "//    from this software without specific prior written permission.",
        "//",
        "// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS ``AS IS'' AND ANY",
        "// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE",
        "// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR",
        "// PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR",
        "// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,",
        "// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,",
        "// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR",
        "// PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY",
        "// OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT",
        "// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE",
        "// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.",
        "//",
        "//----------------------------------------------------------------------------------",
        "",
        "#define FXAA_PC 1",
        "#define FXAA_GLSL_100 1",
        "#define FXAA_QUALITY_PRESET 12",
        "",
        "#define FXAA_GREEN_AS_LUMA 1",
        "",
        "/*--------------------------------------------------------------------------*/",
        "#ifndef FXAA_PC_CONSOLE",
        "    //",
        "    // The console algorithm for PC is included",
        "    // for developers targeting really low spec machines.",
        "    // Likely better to just run FXAA_PC, and use a really low preset.",
        "    //",
        "    #define FXAA_PC_CONSOLE 0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#ifndef FXAA_GLSL_120",
        "    #define FXAA_GLSL_120 0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#ifndef FXAA_GLSL_130",
        "    #define FXAA_GLSL_130 0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#ifndef FXAA_HLSL_3",
        "    #define FXAA_HLSL_3 0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#ifndef FXAA_HLSL_4",
        "    #define FXAA_HLSL_4 0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#ifndef FXAA_HLSL_5",
        "    #define FXAA_HLSL_5 0",
        "#endif",
        "/*==========================================================================*/",
        "#ifndef FXAA_GREEN_AS_LUMA",
        "    //",
        "    // For those using non-linear color,",
        "    // and either not able to get luma in alpha, or not wanting to,",
        "    // this enables FXAA to run using green as a proxy for luma.",
        "    // So with this enabled, no need to pack luma in alpha.",
        "    //",
        "    // This will turn off AA on anything which lacks some amount of green.",
        "    // Pure red and blue or combination of only R and B, will get no AA.",
        "    //",
        "    // Might want to lower the settings for both,",
        "    //    fxaaConsoleEdgeThresholdMin",
        "    //    fxaaQualityEdgeThresholdMin",
        "    // In order to insure AA does not get turned off on colors",
        "    // which contain a minor amount of green.",
        "    //",
        "    // 1 = On.",
        "    // 0 = Off.",
        "    //",
        "    #define FXAA_GREEN_AS_LUMA 0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#ifndef FXAA_EARLY_EXIT",
        "    //",
        "    // Controls algorithm's early exit path.",
        "    // On PS3 turning this ON adds 2 cycles to the shader.",
        "    // On 360 turning this OFF adds 10ths of a millisecond to the shader.",
        "    // Turning this off on console will result in a more blurry image.",
        "    // So this defaults to on.",
        "    //",
        "    // 1 = On.",
        "    // 0 = Off.",
        "    //",
        "    #define FXAA_EARLY_EXIT 1",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#ifndef FXAA_DISCARD",
        "    //",
        "    // Only valid for PC OpenGL currently.",
        "    // Probably will not work when FXAA_GREEN_AS_LUMA = 1.",
        "    //",
        "    // 1 = Use discard on pixels which don't need AA.",
        "    //     For APIs which enable concurrent TEX+ROP from same surface.",
        "    // 0 = Return unchanged color on pixels which don't need AA.",
        "    //",
        "    #define FXAA_DISCARD 0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#ifndef FXAA_FAST_PIXEL_OFFSET",
        "    //",
        "    // Used for GLSL 120 only.",
        "    //",
        "    // 1 = GL API supports fast pixel offsets",
        "    // 0 = do not use fast pixel offsets",
        "    //",
        "    #ifdef GL_EXT_gpu_shader4",
        "        #define FXAA_FAST_PIXEL_OFFSET 1",
        "    #endif",
        "    #ifdef GL_NV_gpu_shader5",
        "        #define FXAA_FAST_PIXEL_OFFSET 1",
        "    #endif",
        "    #ifdef GL_ARB_gpu_shader5",
        "        #define FXAA_FAST_PIXEL_OFFSET 1",
        "    #endif",
        "    #ifndef FXAA_FAST_PIXEL_OFFSET",
        "        #define FXAA_FAST_PIXEL_OFFSET 0",
        "    #endif",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#ifndef FXAA_GATHER4_ALPHA",
        "    //",
        "    // 1 = API supports gather4 on alpha channel.",
        "    // 0 = API does not support gather4 on alpha channel.",
        "    //",
        "    #if (FXAA_HLSL_5 == 1)",
        "        #define FXAA_GATHER4_ALPHA 1",
        "    #endif",
        "    #ifdef GL_ARB_gpu_shader5",
        "        #define FXAA_GATHER4_ALPHA 1",
        "    #endif",
        "    #ifdef GL_NV_gpu_shader5",
        "        #define FXAA_GATHER4_ALPHA 1",
        "    #endif",
        "    #ifndef FXAA_GATHER4_ALPHA",
        "        #define FXAA_GATHER4_ALPHA 0",
        "    #endif",
        "#endif",
        "",
        "",
        "/*============================================================================",
        "                        FXAA QUALITY - TUNING KNOBS",
        "------------------------------------------------------------------------------",
        "NOTE the other tuning knobs are now in the shader function inputs!",
        "============================================================================*/",
        "#ifndef FXAA_QUALITY_PRESET",
        "    //",
        "    // Choose the quality preset.",
        "    // This needs to be compiled into the shader as it effects code.",
        "    // Best option to include multiple presets is to",
        "    // in each shader define the preset, then include this file.",
        "    //",
        "    // OPTIONS",
        "    // -----------------------------------------------------------------------",
        "    // 10 to 15 - default medium dither (10=fastest, 15=highest quality)",
        "    // 20 to 29 - less dither, more expensive (20=fastest, 29=highest quality)",
        "    // 39       - no dither, very expensive",
        "    //",
        "    // NOTES",
        "    // -----------------------------------------------------------------------",
        "    // 12 = slightly faster then FXAA 3.9 and higher edge quality (default)",
        "    // 13 = about same speed as FXAA 3.9 and better than 12",
        "    // 23 = closest to FXAA 3.9 visually and performance wise",
        "    //  _ = the lowest digit is directly related to performance",
        "    // _  = the highest digit is directly related to style",
        "    //",
        "    #define FXAA_QUALITY_PRESET 12",
        "#endif",
        "",
        "",
        "/*============================================================================",
        "",
        "                           FXAA QUALITY - PRESETS",
        "",
        "============================================================================*/",
        "",
        "/*============================================================================",
        "                     FXAA QUALITY - MEDIUM DITHER PRESETS",
        "============================================================================*/",
        "#if (FXAA_QUALITY_PRESET == 10)",
        "    #define FXAA_QUALITY_PS 3",
        "    #define FXAA_QUALITY_P0 1.5",
        "    #define FXAA_QUALITY_P1 3.0",
        "    #define FXAA_QUALITY_P2 12.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 11)",
        "    #define FXAA_QUALITY_PS 4",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 3.0",
        "    #define FXAA_QUALITY_P3 12.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 12)",
        "    #define FXAA_QUALITY_PS 5",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 4.0",
        "    #define FXAA_QUALITY_P4 12.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 13)",
        "    #define FXAA_QUALITY_PS 6",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 4.0",
        "    #define FXAA_QUALITY_P5 12.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 14)",
        "    #define FXAA_QUALITY_PS 7",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 2.0",
        "    #define FXAA_QUALITY_P5 4.0",
        "    #define FXAA_QUALITY_P6 12.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 15)",
        "    #define FXAA_QUALITY_PS 8",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 2.0",
        "    #define FXAA_QUALITY_P5 2.0",
        "    #define FXAA_QUALITY_P6 4.0",
        "    #define FXAA_QUALITY_P7 12.0",
        "#endif",
        "",
        "/*============================================================================",
        "                     FXAA QUALITY - LOW DITHER PRESETS",
        "============================================================================*/",
        "#if (FXAA_QUALITY_PRESET == 20)",
        "    #define FXAA_QUALITY_PS 3",
        "    #define FXAA_QUALITY_P0 1.5",
        "    #define FXAA_QUALITY_P1 2.0",
        "    #define FXAA_QUALITY_P2 8.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 21)",
        "    #define FXAA_QUALITY_PS 4",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 8.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 22)",
        "    #define FXAA_QUALITY_PS 5",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 8.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 23)",
        "    #define FXAA_QUALITY_PS 6",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 2.0",
        "    #define FXAA_QUALITY_P5 8.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 24)",
        "    #define FXAA_QUALITY_PS 7",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 2.0",
        "    #define FXAA_QUALITY_P5 3.0",
        "    #define FXAA_QUALITY_P6 8.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 25)",
        "    #define FXAA_QUALITY_PS 8",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 2.0",
        "    #define FXAA_QUALITY_P5 2.0",
        "    #define FXAA_QUALITY_P6 4.0",
        "    #define FXAA_QUALITY_P7 8.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 26)",
        "    #define FXAA_QUALITY_PS 9",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 2.0",
        "    #define FXAA_QUALITY_P5 2.0",
        "    #define FXAA_QUALITY_P6 2.0",
        "    #define FXAA_QUALITY_P7 4.0",
        "    #define FXAA_QUALITY_P8 8.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 27)",
        "    #define FXAA_QUALITY_PS 10",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 2.0",
        "    #define FXAA_QUALITY_P5 2.0",
        "    #define FXAA_QUALITY_P6 2.0",
        "    #define FXAA_QUALITY_P7 2.0",
        "    #define FXAA_QUALITY_P8 4.0",
        "    #define FXAA_QUALITY_P9 8.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 28)",
        "    #define FXAA_QUALITY_PS 11",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 2.0",
        "    #define FXAA_QUALITY_P5 2.0",
        "    #define FXAA_QUALITY_P6 2.0",
        "    #define FXAA_QUALITY_P7 2.0",
        "    #define FXAA_QUALITY_P8 2.0",
        "    #define FXAA_QUALITY_P9 4.0",
        "    #define FXAA_QUALITY_P10 8.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 29)",
        "    #define FXAA_QUALITY_PS 12",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 2.0",
        "    #define FXAA_QUALITY_P5 2.0",
        "    #define FXAA_QUALITY_P6 2.0",
        "    #define FXAA_QUALITY_P7 2.0",
        "    #define FXAA_QUALITY_P8 2.0",
        "    #define FXAA_QUALITY_P9 2.0",
        "    #define FXAA_QUALITY_P10 4.0",
        "    #define FXAA_QUALITY_P11 8.0",
        "#endif",
        "",
        "/*============================================================================",
        "                     FXAA QUALITY - EXTREME QUALITY",
        "============================================================================*/",
        "#if (FXAA_QUALITY_PRESET == 39)",
        "    #define FXAA_QUALITY_PS 12",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.0",
        "    #define FXAA_QUALITY_P2 1.0",
        "    #define FXAA_QUALITY_P3 1.0",
        "    #define FXAA_QUALITY_P4 1.0",
        "    #define FXAA_QUALITY_P5 1.5",
        "    #define FXAA_QUALITY_P6 2.0",
        "    #define FXAA_QUALITY_P7 2.0",
        "    #define FXAA_QUALITY_P8 2.0",
        "    #define FXAA_QUALITY_P9 2.0",
        "    #define FXAA_QUALITY_P10 4.0",
        "    #define FXAA_QUALITY_P11 8.0",
        "#endif",
        "",
        "",
        "",
        "/*============================================================================",
        "",
        "                                API PORTING",
        "",
        "============================================================================*/",
        "#if (FXAA_GLSL_100 == 1) || (FXAA_GLSL_120 == 1) || (FXAA_GLSL_130 == 1)",
        "    #define FxaaBool bool",
        "    #define FxaaDiscard discard",
        "    #define FxaaFloat float",
        "    #define FxaaFloat2 vec2",
        "    #define FxaaFloat3 vec3",
        "    #define FxaaFloat4 vec4",
        "    #define FxaaHalf float",
        "    #define FxaaHalf2 vec2",
        "    #define FxaaHalf3 vec3",
        "    #define FxaaHalf4 vec4",
        "    #define FxaaInt2 ivec2",
        "    #define FxaaSat(x) clamp(x, 0.0, 1.0)",
        "    #define FxaaTex sampler2D",
        "#else",
        "    #define FxaaBool bool",
        "    #define FxaaDiscard clip(-1)",
        "    #define FxaaFloat float",
        "    #define FxaaFloat2 float2",
        "    #define FxaaFloat3 float3",
        "    #define FxaaFloat4 float4",
        "    #define FxaaHalf half",
        "    #define FxaaHalf2 half2",
        "    #define FxaaHalf3 half3",
        "    #define FxaaHalf4 half4",
        "    #define FxaaSat(x) saturate(x)",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_GLSL_100 == 1)",
        "  #define FxaaTexTop(t, p) texture2D(t, p, 0.0)",
        "  #define FxaaTexOff(t, p, o, r) texture2D(t, p + (o * r), 0.0)",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_GLSL_120 == 1)",
        "    // Requires,",
        "    //  #version 120",
        "    // And at least,",
        "    //  #extension GL_EXT_gpu_shader4 : enable",
        "    //  (or set FXAA_FAST_PIXEL_OFFSET 1 to work like DX9)",
        "    #define FxaaTexTop(t, p) texture2DLod(t, p, 0.0)",
        "    #if (FXAA_FAST_PIXEL_OFFSET == 1)",
        "        #define FxaaTexOff(t, p, o, r) texture2DLodOffset(t, p, 0.0, o)",
        "    #else",
        "        #define FxaaTexOff(t, p, o, r) texture2DLod(t, p + (o * r), 0.0)",
        "    #endif",
        "    #if (FXAA_GATHER4_ALPHA == 1)",
        "        // use #extension GL_ARB_gpu_shader5 : enable",
        "        #define FxaaTexAlpha4(t, p) textureGather(t, p, 3)",
        "        #define FxaaTexOffAlpha4(t, p, o) textureGatherOffset(t, p, o, 3)",
        "        #define FxaaTexGreen4(t, p) textureGather(t, p, 1)",
        "        #define FxaaTexOffGreen4(t, p, o) textureGatherOffset(t, p, o, 1)",
        "    #endif",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_GLSL_130 == 1)",
        "    // Requires \"#version 130\" or better",
        "    #define FxaaTexTop(t, p) textureLod(t, p, 0.0)",
        "    #define FxaaTexOff(t, p, o, r) textureLodOffset(t, p, 0.0, o)",
        "    #if (FXAA_GATHER4_ALPHA == 1)",
        "        // use #extension GL_ARB_gpu_shader5 : enable",
        "        #define FxaaTexAlpha4(t, p) textureGather(t, p, 3)",
        "        #define FxaaTexOffAlpha4(t, p, o) textureGatherOffset(t, p, o, 3)",
        "        #define FxaaTexGreen4(t, p) textureGather(t, p, 1)",
        "        #define FxaaTexOffGreen4(t, p, o) textureGatherOffset(t, p, o, 1)",
        "    #endif",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_HLSL_3 == 1)",
        "    #define FxaaInt2 float2",
        "    #define FxaaTex sampler2D",
        "    #define FxaaTexTop(t, p) tex2Dlod(t, float4(p, 0.0, 0.0))",
        "    #define FxaaTexOff(t, p, o, r) tex2Dlod(t, float4(p + (o * r), 0, 0))",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_HLSL_4 == 1)",
        "    #define FxaaInt2 int2",
        "    struct FxaaTex { SamplerState smpl; Texture2D tex; };",
        "    #define FxaaTexTop(t, p) t.tex.SampleLevel(t.smpl, p, 0.0)",
        "    #define FxaaTexOff(t, p, o, r) t.tex.SampleLevel(t.smpl, p, 0.0, o)",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_HLSL_5 == 1)",
        "    #define FxaaInt2 int2",
        "    struct FxaaTex { SamplerState smpl; Texture2D tex; };",
        "    #define FxaaTexTop(t, p) t.tex.SampleLevel(t.smpl, p, 0.0)",
        "    #define FxaaTexOff(t, p, o, r) t.tex.SampleLevel(t.smpl, p, 0.0, o)",
        "    #define FxaaTexAlpha4(t, p) t.tex.GatherAlpha(t.smpl, p)",
        "    #define FxaaTexOffAlpha4(t, p, o) t.tex.GatherAlpha(t.smpl, p, o)",
        "    #define FxaaTexGreen4(t, p) t.tex.GatherGreen(t.smpl, p)",
        "    #define FxaaTexOffGreen4(t, p, o) t.tex.GatherGreen(t.smpl, p, o)",
        "#endif",
        "",
        "",
        "/*============================================================================",
        "                   GREEN AS LUMA OPTION SUPPORT FUNCTION",
        "============================================================================*/",
        "#if (FXAA_GREEN_AS_LUMA == 0)",
        "    FxaaFloat FxaaLuma(FxaaFloat4 rgba) { return rgba.w; }",
        "#else",
        "    FxaaFloat FxaaLuma(FxaaFloat4 rgba) { return rgba.y; }",
        "#endif",
        "",
        "",
        "",
        "",
        "/*============================================================================",
        "",
        "                             FXAA3 QUALITY - PC",
        "",
        "============================================================================*/",
        "#if (FXAA_PC == 1)",
        "/*--------------------------------------------------------------------------*/",
        "FxaaFloat4 FxaaPixelShader(",
        "    //",
        "    // Use noperspective interpolation here (turn off perspective interpolation).",
        "    // {xy} = center of pixel",
        "    FxaaFloat2 pos,",
        "    //",
        "    // Used only for FXAA Console, and not used on the 360 version.",
        "    // Use noperspective interpolation here (turn off perspective interpolation).",
        "    // {xy_} = upper left of pixel",
        "    // {_zw} = lower right of pixel",
        "    FxaaFloat4 fxaaConsolePosPos,",
        "    //",
        "    // Input color texture.",
        "    // {rgb_} = color in linear or perceptual color space",
        "    // if (FXAA_GREEN_AS_LUMA == 0)",
        "    //     {__a} = luma in perceptual color space (not linear)",
        "    FxaaTex tex,",
        "    //",
        "    // Only used on the optimized 360 version of FXAA Console.",
        "    // For everything but 360, just use the same input here as for \"tex\".",
        "    // For 360, same texture, just alias with a 2nd sampler.",
        "    // This sampler needs to have an exponent bias of -1.",
        "    FxaaTex fxaaConsole360TexExpBiasNegOne,",
        "    //",
        "    // Only used on the optimized 360 version of FXAA Console.",
        "    // For everything but 360, just use the same input here as for \"tex\".",
        "    // For 360, same texture, just alias with a 3nd sampler.",
        "    // This sampler needs to have an exponent bias of -2.",
        "    FxaaTex fxaaConsole360TexExpBiasNegTwo,",
        "    //",
        "    // Only used on FXAA Quality.",
        "    // This must be from a constant/uniform.",
        "    // {x_} = 1.0/screenWidthInPixels",
        "    // {_y} = 1.0/screenHeightInPixels",
        "    FxaaFloat2 fxaaQualityRcpFrame,",
        "    //",
        "    // Only used on FXAA Console.",
        "    // This must be from a constant/uniform.",
        "    // This effects sub-pixel AA quality and inversely sharpness.",
        "    //   Where N ranges between,",
        "    //     N = 0.50 (default)",
        "    //     N = 0.33 (sharper)",
        "    // {x__} = -N/screenWidthInPixels",
        "    // {_y_} = -N/screenHeightInPixels",
        "    // {_z_} =  N/screenWidthInPixels",
        "    // {__w} =  N/screenHeightInPixels",
        "    FxaaFloat4 fxaaConsoleRcpFrameOpt,",
        "    //",
        "    // Only used on FXAA Console.",
        "    // Not used on 360, but used on PS3 and PC.",
        "    // This must be from a constant/uniform.",
        "    // {x__} = -2.0/screenWidthInPixels",
        "    // {_y_} = -2.0/screenHeightInPixels",
        "    // {_z_} =  2.0/screenWidthInPixels",
        "    // {__w} =  2.0/screenHeightInPixels",
        "    FxaaFloat4 fxaaConsoleRcpFrameOpt2,",
        "    //",
        "    // Only used on FXAA Console.",
        "    // Only used on 360 in place of fxaaConsoleRcpFrameOpt2.",
        "    // This must be from a constant/uniform.",
        "    // {x__} =  8.0/screenWidthInPixels",
        "    // {_y_} =  8.0/screenHeightInPixels",
        "    // {_z_} = -4.0/screenWidthInPixels",
        "    // {__w} = -4.0/screenHeightInPixels",
        "    FxaaFloat4 fxaaConsole360RcpFrameOpt2,",
        "    //",
        "    // Only used on FXAA Quality.",
        "    // This used to be the FXAA_QUALITY_SUBPIX define.",
        "    // It is here now to allow easier tuning.",
        "    // Choose the amount of sub-pixel aliasing removal.",
        "    // This can effect sharpness.",
        "    //   1.00 - upper limit (softer)",
        "    //   0.75 - default amount of filtering",
        "    //   0.50 - lower limit (sharper, less sub-pixel aliasing removal)",
        "    //   0.25 - almost off",
        "    //   0.00 - completely off",
        "    FxaaFloat fxaaQualitySubpix,",
        "    //",
        "    // Only used on FXAA Quality.",
        "    // This used to be the FXAA_QUALITY_EDGE_THRESHOLD define.",
        "    // It is here now to allow easier tuning.",
        "    // The minimum amount of local contrast required to apply algorithm.",
        "    //   0.333 - too little (faster)",
        "    //   0.250 - low quality",
        "    //   0.166 - default",
        "    //   0.125 - high quality",
        "    //   0.063 - overkill (slower)",
        "    FxaaFloat fxaaQualityEdgeThreshold,",
        "    //",
        "    // Only used on FXAA Quality.",
        "    // This used to be the FXAA_QUALITY_EDGE_THRESHOLD_MIN define.",
        "    // It is here now to allow easier tuning.",
        "    // Trims the algorithm from processing darks.",
        "    //   0.0833 - upper limit (default, the start of visible unfiltered edges)",
        "    //   0.0625 - high quality (faster)",
        "    //   0.0312 - visible limit (slower)",
        "    // Special notes when using FXAA_GREEN_AS_LUMA,",
        "    //   Likely want to set this to zero.",
        "    //   As colors that are mostly not-green",
        "    //   will appear very dark in the green channel!",
        "    //   Tune by looking at mostly non-green content,",
        "    //   then start at zero and increase until aliasing is a problem.",
        "    FxaaFloat fxaaQualityEdgeThresholdMin,",
        "    //",
        "    // Only used on FXAA Console.",
        "    // This used to be the FXAA_CONSOLE_EDGE_SHARPNESS define.",
        "    // It is here now to allow easier tuning.",
        "    // This does not effect PS3, as this needs to be compiled in.",
        "    //   Use FXAA_CONSOLE_PS3_EDGE_SHARPNESS for PS3.",
        "    //   Due to the PS3 being ALU bound,",
        "    //   there are only three safe values here: 2 and 4 and 8.",
        "    //   These options use the shaders ability to a free *|/ by 2|4|8.",
        "    // For all other platforms can be a non-power of two.",
        "    //   8.0 is sharper (default!!!)",
        "    //   4.0 is softer",
        "    //   2.0 is really soft (good only for vector graphics inputs)",
        "    FxaaFloat fxaaConsoleEdgeSharpness,",
        "    //",
        "    // Only used on FXAA Console.",
        "    // This used to be the FXAA_CONSOLE_EDGE_THRESHOLD define.",
        "    // It is here now to allow easier tuning.",
        "    // This does not effect PS3, as this needs to be compiled in.",
        "    //   Use FXAA_CONSOLE_PS3_EDGE_THRESHOLD for PS3.",
        "    //   Due to the PS3 being ALU bound,",
        "    //   there are only two safe values here: 1/4 and 1/8.",
        "    //   These options use the shaders ability to a free *|/ by 2|4|8.",
        "    // The console setting has a different mapping than the quality setting.",
        "    // Other platforms can use other values.",
        "    //   0.125 leaves less aliasing, but is softer (default!!!)",
        "    //   0.25 leaves more aliasing, and is sharper",
        "    FxaaFloat fxaaConsoleEdgeThreshold,",
        "    //",
        "    // Only used on FXAA Console.",
        "    // This used to be the FXAA_CONSOLE_EDGE_THRESHOLD_MIN define.",
        "    // It is here now to allow easier tuning.",
        "    // Trims the algorithm from processing darks.",
        "    // The console setting has a different mapping than the quality setting.",
        "    // This only applies when FXAA_EARLY_EXIT is 1.",
        "    // This does not apply to PS3,",
        "    // PS3 was simplified to avoid more shader instructions.",
        "    //   0.06 - faster but more aliasing in darks",
        "    //   0.05 - default",
        "    //   0.04 - slower and less aliasing in darks",
        "    // Special notes when using FXAA_GREEN_AS_LUMA,",
        "    //   Likely want to set this to zero.",
        "    //   As colors that are mostly not-green",
        "    //   will appear very dark in the green channel!",
        "    //   Tune by looking at mostly non-green content,",
        "    //   then start at zero and increase until aliasing is a problem.",
        "    FxaaFloat fxaaConsoleEdgeThresholdMin,",
        "    //",
        "    // Extra constants for 360 FXAA Console only.",
        "    // Use zeros or anything else for other platforms.",
        "    // These must be in physical constant registers and NOT immedates.",
        "    // Immedates will result in compiler un-optimizing.",
        "    // {xyzw} = float4(1.0, -1.0, 0.25, -0.25)",
        "    FxaaFloat4 fxaaConsole360ConstDir",
        ") {",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat2 posM;",
        "    posM.x = pos.x;",
        "    posM.y = pos.y;",
        "    #if (FXAA_GATHER4_ALPHA == 1)",
        "        #if (FXAA_DISCARD == 0)",
        "            FxaaFloat4 rgbyM = FxaaTexTop(tex, posM);",
        "            #if (FXAA_GREEN_AS_LUMA == 0)",
        "                #define lumaM rgbyM.w",
        "            #else",
        "                #define lumaM rgbyM.y",
        "            #endif",
        "        #endif",
        "        #if (FXAA_GREEN_AS_LUMA == 0)",
        "            FxaaFloat4 luma4A = FxaaTexAlpha4(tex, posM);",
        "            FxaaFloat4 luma4B = FxaaTexOffAlpha4(tex, posM, FxaaInt2(-1, -1));",
        "        #else",
        "            FxaaFloat4 luma4A = FxaaTexGreen4(tex, posM);",
        "            FxaaFloat4 luma4B = FxaaTexOffGreen4(tex, posM, FxaaInt2(-1, -1));",
        "        #endif",
        "        #if (FXAA_DISCARD == 1)",
        "            #define lumaM luma4A.w",
        "        #endif",
        "        #define lumaE luma4A.z",
        "        #define lumaS luma4A.x",
        "        #define lumaSE luma4A.y",
        "        #define lumaNW luma4B.w",
        "        #define lumaN luma4B.z",
        "        #define lumaW luma4B.x",
        "    #else",
        "        FxaaFloat4 rgbyM = FxaaTexTop(tex, posM);",
        "        #if (FXAA_GREEN_AS_LUMA == 0)",
        "            #define lumaM rgbyM.w",
        "        #else",
        "            #define lumaM rgbyM.y",
        "        #endif",
        "        #if (FXAA_GLSL_100 == 1)",
        "          FxaaFloat lumaS = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 0.0, 1.0), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaE = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 1.0, 0.0), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaN = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 0.0,-1.0), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaW = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2(-1.0, 0.0), fxaaQualityRcpFrame.xy));",
        "        #else",
        "          FxaaFloat lumaS = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 0, 1), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 1, 0), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaN = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 0,-1), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1, 0), fxaaQualityRcpFrame.xy));",
        "        #endif",
        "    #endif",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat maxSM = max(lumaS, lumaM);",
        "    FxaaFloat minSM = min(lumaS, lumaM);",
        "    FxaaFloat maxESM = max(lumaE, maxSM);",
        "    FxaaFloat minESM = min(lumaE, minSM);",
        "    FxaaFloat maxWN = max(lumaN, lumaW);",
        "    FxaaFloat minWN = min(lumaN, lumaW);",
        "    FxaaFloat rangeMax = max(maxWN, maxESM);",
        "    FxaaFloat rangeMin = min(minWN, minESM);",
        "    FxaaFloat rangeMaxScaled = rangeMax * fxaaQualityEdgeThreshold;",
        "    FxaaFloat range = rangeMax - rangeMin;",
        "    FxaaFloat rangeMaxClamped = max(fxaaQualityEdgeThresholdMin, rangeMaxScaled);",
        "    FxaaBool earlyExit = range < rangeMaxClamped;",
        "/*--------------------------------------------------------------------------*/",
        "    if(earlyExit)",
        "        #if (FXAA_DISCARD == 1)",
        "            FxaaDiscard;",
        "        #else",
        "            return rgbyM;",
        "        #endif",
        "/*--------------------------------------------------------------------------*/",
        "    #if (FXAA_GATHER4_ALPHA == 0)",
        "        #if (FXAA_GLSL_100 == 1)",
        "          FxaaFloat lumaNW = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2(-1.0,-1.0), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaSE = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 1.0, 1.0), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaNE = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 1.0,-1.0), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaSW = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2(-1.0, 1.0), fxaaQualityRcpFrame.xy));",
        "        #else",
        "          FxaaFloat lumaNW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1,-1), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaSE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 1, 1), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaNE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 1,-1), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaSW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1, 1), fxaaQualityRcpFrame.xy));",
        "        #endif",
        "    #else",
        "        FxaaFloat lumaNE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(1, -1), fxaaQualityRcpFrame.xy));",
        "        FxaaFloat lumaSW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1, 1), fxaaQualityRcpFrame.xy));",
        "    #endif",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat lumaNS = lumaN + lumaS;",
        "    FxaaFloat lumaWE = lumaW + lumaE;",
        "    FxaaFloat subpixRcpRange = 1.0/range;",
        "    FxaaFloat subpixNSWE = lumaNS + lumaWE;",
        "    FxaaFloat edgeHorz1 = (-2.0 * lumaM) + lumaNS;",
        "    FxaaFloat edgeVert1 = (-2.0 * lumaM) + lumaWE;",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat lumaNESE = lumaNE + lumaSE;",
        "    FxaaFloat lumaNWNE = lumaNW + lumaNE;",
        "    FxaaFloat edgeHorz2 = (-2.0 * lumaE) + lumaNESE;",
        "    FxaaFloat edgeVert2 = (-2.0 * lumaN) + lumaNWNE;",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat lumaNWSW = lumaNW + lumaSW;",
        "    FxaaFloat lumaSWSE = lumaSW + lumaSE;",
        "    FxaaFloat edgeHorz4 = (abs(edgeHorz1) * 2.0) + abs(edgeHorz2);",
        "    FxaaFloat edgeVert4 = (abs(edgeVert1) * 2.0) + abs(edgeVert2);",
        "    FxaaFloat edgeHorz3 = (-2.0 * lumaW) + lumaNWSW;",
        "    FxaaFloat edgeVert3 = (-2.0 * lumaS) + lumaSWSE;",
        "    FxaaFloat edgeHorz = abs(edgeHorz3) + edgeHorz4;",
        "    FxaaFloat edgeVert = abs(edgeVert3) + edgeVert4;",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat subpixNWSWNESE = lumaNWSW + lumaNESE;",
        "    FxaaFloat lengthSign = fxaaQualityRcpFrame.x;",
        "    FxaaBool horzSpan = edgeHorz >= edgeVert;",
        "    FxaaFloat subpixA = subpixNSWE * 2.0 + subpixNWSWNESE;",
        "/*--------------------------------------------------------------------------*/",
        "    if(!horzSpan) lumaN = lumaW;",
        "    if(!horzSpan) lumaS = lumaE;",
        "    if(horzSpan) lengthSign = fxaaQualityRcpFrame.y;",
        "    FxaaFloat subpixB = (subpixA * (1.0/12.0)) - lumaM;",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat gradientN = lumaN - lumaM;",
        "    FxaaFloat gradientS = lumaS - lumaM;",
        "    FxaaFloat lumaNN = lumaN + lumaM;",
        "    FxaaFloat lumaSS = lumaS + lumaM;",
        "    FxaaBool pairN = abs(gradientN) >= abs(gradientS);",
        "    FxaaFloat gradient = max(abs(gradientN), abs(gradientS));",
        "    if(pairN) lengthSign = -lengthSign;",
        "    FxaaFloat subpixC = FxaaSat(abs(subpixB) * subpixRcpRange);",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat2 posB;",
        "    posB.x = posM.x;",
        "    posB.y = posM.y;",
        "    FxaaFloat2 offNP;",
        "    offNP.x = (!horzSpan) ? 0.0 : fxaaQualityRcpFrame.x;",
        "    offNP.y = ( horzSpan) ? 0.0 : fxaaQualityRcpFrame.y;",
        "    if(!horzSpan) posB.x += lengthSign * 0.5;",
        "    if( horzSpan) posB.y += lengthSign * 0.5;",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat2 posN;",
        "    posN.x = posB.x - offNP.x * FXAA_QUALITY_P0;",
        "    posN.y = posB.y - offNP.y * FXAA_QUALITY_P0;",
        "    FxaaFloat2 posP;",
        "    posP.x = posB.x + offNP.x * FXAA_QUALITY_P0;",
        "    posP.y = posB.y + offNP.y * FXAA_QUALITY_P0;",
        "    FxaaFloat subpixD = ((-2.0)*subpixC) + 3.0;",
        "    FxaaFloat lumaEndN = FxaaLuma(FxaaTexTop(tex, posN));",
        "    FxaaFloat subpixE = subpixC * subpixC;",
        "    FxaaFloat lumaEndP = FxaaLuma(FxaaTexTop(tex, posP));",
        "/*--------------------------------------------------------------------------*/",
        "    if(!pairN) lumaNN = lumaSS;",
        "    FxaaFloat gradientScaled = gradient * 1.0/4.0;",
        "    FxaaFloat lumaMM = lumaM - lumaNN * 0.5;",
        "    FxaaFloat subpixF = subpixD * subpixE;",
        "    FxaaBool lumaMLTZero = lumaMM < 0.0;",
        "/*--------------------------------------------------------------------------*/",
        "    lumaEndN -= lumaNN * 0.5;",
        "    lumaEndP -= lumaNN * 0.5;",
        "    FxaaBool doneN = abs(lumaEndN) >= gradientScaled;",
        "    FxaaBool doneP = abs(lumaEndP) >= gradientScaled;",
        "    if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P1;",
        "    if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P1;",
        "    FxaaBool doneNP = (!doneN) || (!doneP);",
        "    if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P1;",
        "    if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P1;",
        "/*--------------------------------------------------------------------------*/",
        "    if(doneNP) {",
        "        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "        doneN = abs(lumaEndN) >= gradientScaled;",
        "        doneP = abs(lumaEndP) >= gradientScaled;",
        "        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P2;",
        "        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P2;",
        "        doneNP = (!doneN) || (!doneP);",
        "        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P2;",
        "        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P2;",
        "/*--------------------------------------------------------------------------*/",
        "        #if (FXAA_QUALITY_PS > 3)",
        "        if(doneNP) {",
        "            if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "            if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "            if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "            if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "            doneN = abs(lumaEndN) >= gradientScaled;",
        "            doneP = abs(lumaEndP) >= gradientScaled;",
        "            if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P3;",
        "            if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P3;",
        "            doneNP = (!doneN) || (!doneP);",
        "            if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P3;",
        "            if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P3;",
        "/*--------------------------------------------------------------------------*/",
        "            #if (FXAA_QUALITY_PS > 4)",
        "            if(doneNP) {",
        "                if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "                if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "                if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "                if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "                doneN = abs(lumaEndN) >= gradientScaled;",
        "                doneP = abs(lumaEndP) >= gradientScaled;",
        "                if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P4;",
        "                if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P4;",
        "                doneNP = (!doneN) || (!doneP);",
        "                if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P4;",
        "                if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P4;",
        "/*--------------------------------------------------------------------------*/",
        "                #if (FXAA_QUALITY_PS > 5)",
        "                if(doneNP) {",
        "                    if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "                    if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "                    if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "                    if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "                    doneN = abs(lumaEndN) >= gradientScaled;",
        "                    doneP = abs(lumaEndP) >= gradientScaled;",
        "                    if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P5;",
        "                    if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P5;",
        "                    doneNP = (!doneN) || (!doneP);",
        "                    if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P5;",
        "                    if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P5;",
        "/*--------------------------------------------------------------------------*/",
        "                    #if (FXAA_QUALITY_PS > 6)",
        "                    if(doneNP) {",
        "                        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "                        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "                        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "                        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "                        doneN = abs(lumaEndN) >= gradientScaled;",
        "                        doneP = abs(lumaEndP) >= gradientScaled;",
        "                        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P6;",
        "                        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P6;",
        "                        doneNP = (!doneN) || (!doneP);",
        "                        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P6;",
        "                        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P6;",
        "/*--------------------------------------------------------------------------*/",
        "                        #if (FXAA_QUALITY_PS > 7)",
        "                        if(doneNP) {",
        "                            if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "                            if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "                            if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "                            if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "                            doneN = abs(lumaEndN) >= gradientScaled;",
        "                            doneP = abs(lumaEndP) >= gradientScaled;",
        "                            if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P7;",
        "                            if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P7;",
        "                            doneNP = (!doneN) || (!doneP);",
        "                            if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P7;",
        "                            if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P7;",
        "/*--------------------------------------------------------------------------*/",
        "    #if (FXAA_QUALITY_PS > 8)",
        "    if(doneNP) {",
        "        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "        doneN = abs(lumaEndN) >= gradientScaled;",
        "        doneP = abs(lumaEndP) >= gradientScaled;",
        "        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P8;",
        "        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P8;",
        "        doneNP = (!doneN) || (!doneP);",
        "        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P8;",
        "        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P8;",
        "/*--------------------------------------------------------------------------*/",
        "        #if (FXAA_QUALITY_PS > 9)",
        "        if(doneNP) {",
        "            if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "            if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "            if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "            if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "            doneN = abs(lumaEndN) >= gradientScaled;",
        "            doneP = abs(lumaEndP) >= gradientScaled;",
        "            if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P9;",
        "            if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P9;",
        "            doneNP = (!doneN) || (!doneP);",
        "            if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P9;",
        "            if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P9;",
        "/*--------------------------------------------------------------------------*/",
        "            #if (FXAA_QUALITY_PS > 10)",
        "            if(doneNP) {",
        "                if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "                if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "                if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "                if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "                doneN = abs(lumaEndN) >= gradientScaled;",
        "                doneP = abs(lumaEndP) >= gradientScaled;",
        "                if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P10;",
        "                if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P10;",
        "                doneNP = (!doneN) || (!doneP);",
        "                if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P10;",
        "                if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P10;",
        "/*--------------------------------------------------------------------------*/",
        "                #if (FXAA_QUALITY_PS > 11)",
        "                if(doneNP) {",
        "                    if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "                    if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "                    if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "                    if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "                    doneN = abs(lumaEndN) >= gradientScaled;",
        "                    doneP = abs(lumaEndP) >= gradientScaled;",
        "                    if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P11;",
        "                    if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P11;",
        "                    doneNP = (!doneN) || (!doneP);",
        "                    if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P11;",
        "                    if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P11;",
        "/*--------------------------------------------------------------------------*/",
        "                    #if (FXAA_QUALITY_PS > 12)",
        "                    if(doneNP) {",
        "                        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "                        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "                        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "                        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "                        doneN = abs(lumaEndN) >= gradientScaled;",
        "                        doneP = abs(lumaEndP) >= gradientScaled;",
        "                        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P12;",
        "                        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P12;",
        "                        doneNP = (!doneN) || (!doneP);",
        "                        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P12;",
        "                        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P12;",
        "/*--------------------------------------------------------------------------*/",
        "                    }",
        "                    #endif",
        "/*--------------------------------------------------------------------------*/",
        "                }",
        "                #endif",
        "/*--------------------------------------------------------------------------*/",
        "            }",
        "            #endif",
        "/*--------------------------------------------------------------------------*/",
        "        }",
        "        #endif",
        "/*--------------------------------------------------------------------------*/",
        "    }",
        "    #endif",
        "/*--------------------------------------------------------------------------*/",
        "                        }",
        "                        #endif",
        "/*--------------------------------------------------------------------------*/",
        "                    }",
        "                    #endif",
        "/*--------------------------------------------------------------------------*/",
        "                }",
        "                #endif",
        "/*--------------------------------------------------------------------------*/",
        "            }",
        "            #endif",
        "/*--------------------------------------------------------------------------*/",
        "        }",
        "        #endif",
        "/*--------------------------------------------------------------------------*/",
        "    }",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat dstN = posM.x - posN.x;",
        "    FxaaFloat dstP = posP.x - posM.x;",
        "    if(!horzSpan) dstN = posM.y - posN.y;",
        "    if(!horzSpan) dstP = posP.y - posM.y;",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaBool goodSpanN = (lumaEndN < 0.0) != lumaMLTZero;",
        "    FxaaFloat spanLength = (dstP + dstN);",
        "    FxaaBool goodSpanP = (lumaEndP < 0.0) != lumaMLTZero;",
        "    FxaaFloat spanLengthRcp = 1.0/spanLength;",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaBool directionN = dstN < dstP;",
        "    FxaaFloat dst = min(dstN, dstP);",
        "    FxaaBool goodSpan = directionN ? goodSpanN : goodSpanP;",
        "    FxaaFloat subpixG = subpixF * subpixF;",
        "    FxaaFloat pixelOffset = (dst * (-spanLengthRcp)) + 0.5;",
        "    FxaaFloat subpixH = subpixG * fxaaQualitySubpix;",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat pixelOffsetGood = goodSpan ? pixelOffset : 0.0;",
        "    FxaaFloat pixelOffsetSubpix = max(pixelOffsetGood, subpixH);",
        "    if(!horzSpan) posM.x += pixelOffsetSubpix * lengthSign;",
        "    if( horzSpan) posM.y += pixelOffsetSubpix * lengthSign;",
        "    #if (FXAA_DISCARD == 1)",
        "        return FxaaTexTop(tex, posM);",
        "    #else",
        "        return FxaaFloat4(FxaaTexTop(tex, posM).xyz, lumaM);",
        "    #endif",
        "}",
        "/*==========================================================================*/",
        "#endif",
        "",
        "void main() {",
        "  gl_FragColor = FxaaPixelShader(",
        "    vUv,",
        "    vec4(0.0),",
        "    tDiffuse,",
        "    tDiffuse,",
        "    tDiffuse,",
        "    resolution,",
        "    vec4(0.0),",
        "    vec4(0.0),",
        "    vec4(0.0),",
        "    0.75,",
        "    0.166,",
        "    0.0833,",
        "    0.0,",
        "    0.0,",
        "    0.0,",
        "    vec4(0.0)",
        "  );",
        "",
        "  // TODO avoid querying texture twice for same texel",
        "  gl_FragColor.a = texture2D(tDiffuse, vUv).a;",
        "}"
	].join("\n")

};

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

let rndString = (len) => {
  if (len <= 0) {
    return '';
  }
  len = len - 1 || 31;
  let $chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let maxPos = $chars.length + 1;
  let pwd = $chars.charAt(Math.floor(Math.random() * (maxPos - 10)));
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
};

let geoToCartesian = (lat = 0, lon = 0, radius = 1) => {
  lat *= Math.PI / 180;
  lon *= Math.PI / 180;
  return new THREE.Vector3(-radius * Math.cos(lat) * Math.cos(lon),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.sin(lon)
  );
};

let Util = {
  extend: _extends,
  rndInt,
  rndString,
  geoToCartesian
};

/* eslint-disable */


//export * from './thirdparty/three.module.js';

export { DefaultSettings, App, Bind, FBOWorld, LoopManager, Monitor, QRCode, Transitioner, View, VR, World, NotFunctionError, EventManager, Events, FBOEventMapper, Signal, GUI, Body, Txt, Div, LoaderFactory, EffectComposer, AfterimagePass, Pass, DotScreenPass, RenderPass, ShaderPass, GlitchPass, OutlinePass, WatercolorPass, TestPass, AfterimageShader, CopyShader, DotScreenShader, FXAAShader, GlitchShader, WatercolorShader, TestShader, Util };
//# sourceMappingURL=nova.module.js.map
