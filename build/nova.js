(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three'), require('lodash')) :
	typeof define === 'function' && define.amd ? define(['exports', 'three', 'lodash'], factory) :
	(factory((global.NOVA = {}),global.THREE,global._));
}(this, (function (exports,three,lodash) { 'use strict';

	//适合大部分WebGL的APP设置
	var DefaultSettings = {
		parent: document.body, //APP所在DOM容器
		setCommonCSS: true, //设置默认CSS样式，无法滚动，超出区域不显示，取消所有内外边距
		autoStart: true, //自动执行渲染循环和逻辑循环
		autoResize: true, //自动拉伸自适应不同屏幕分辨率
		VRSupport: false, //是否加载VR支持模块
		renderer: {
			clearColor: 0x000000, //渲染器的默认清除颜色
			clearAlpha: 1, //渲染器的默认清除颜色的透明度
			pixelRatio: window.devicePixelRatio || 1, //用于移动平台的清晰度
			precision: "highp", // 渲染精细度，默认为高
			antialias: true, //是否开启抗锯齿
			alpha: false, // 渲染器是否保存alpha缓冲
			logarithmicDepthBuffer: false, // 逻辑深度缓冲
			preserveDrawingBuffer: false
		},
		normalEventList: ["click", "mousedown", "mouseup", "touchstart", "touchend", "touchmove", "mousemove"], //默认开启的原生事件监听，不建议将所有的事件监听都写在里面，每一个事件监听都会增加一次射线法碰撞检测，如果不必要的事件过多会降低性能
		hammerEventList: "press tap pressup pan swipe" //默认hammer手势事件的监听，同normalEventList一样，用到什么加入什么，不要一大堆东西全塞进去
	};

	var classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	var createClass = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

	var inherits = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	};

	var possibleConstructorReturn = function (self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return call && (typeof call === "object" || typeof call === "function") ? call : self;
	};

	var slicedToArray = function () {
	  function sliceIterator(arr, i) {
	    var _arr = [];
	    var _n = true;
	    var _d = false;
	    var _e = undefined;

	    try {
	      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
	        _arr.push(_s.value);

	        if (i && _arr.length === i) break;
	      }
	    } catch (err) {
	      _d = true;
	      _e = err;
	    } finally {
	      try {
	        if (!_n && _i["return"]) _i["return"]();
	      } finally {
	        if (_d) throw _e;
	      }
	    }

	    return _arr;
	  }

	  return function (arr, i) {
	    if (Array.isArray(arr)) {
	      return arr;
	    } else if (Symbol.iterator in Object(arr)) {
	      return sliceIterator(arr, i);
	    } else {
	      throw new TypeError("Invalid attempt to destructure non-iterable instance");
	    }
	  };
	}();

	var NotFunctionError = function (_Error) {
		inherits(NotFunctionError, _Error);

		function NotFunctionError(message) {
			classCallCheck(this, NotFunctionError);

			var _this = possibleConstructorReturn(this, (NotFunctionError.__proto__ || Object.getPrototypeOf(NotFunctionError)).call(this, message));

			_this.name = 'NotFunctionError';
			_this.message = message || 'The object is not a function.';

			return _this;
		}

		return NotFunctionError;
	}(Error);

	var LoopManager = function () {
			function LoopManager() {
					var cycleLevel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
					classCallCheck(this, LoopManager);


					//当它是true，不执行该循环
					this.disable = false;
					//记录循环次数
					this.times = 0;
					//每隔多少循环执行一次update，用于调整fps。数字越大，fps越低
					this.cycleLevel = cycleLevel <= 1 ? 1 : cycleLevel;
					this.functionMap = new Map();
			}

			createClass(LoopManager, [{
					key: 'update',
					value: function update(time) {

							this.times++;
							if (this.disable || this.times % this.cycleLevel !== 0) {

									return;
							}
							this.functionMap.forEach(function (value) {

									value(time);
							});
					}
			}, {
					key: 'add',
					value: function add(func, key) {

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
			}, {
					key: 'removeAll',
					value: function removeAll() {

							this.functionMap.clear();
					}
			}, {
					key: 'remove',
					value: function remove(funcOrKey) {
							var _this = this;

							if (typeof funcOrKey === 'function') {

									this.functionMap.forEach(function (value, key) {

											if (value === funcOrKey) {

													return _this.functionMap.delete(key);
											}
									});
									return false;
							} else {

									return this.functionMap.delete(funcOrKey);
							}
					}
			}]);
			return LoopManager;
	}();

	var EventManager = function () {
			function EventManager(world) {
					var _this = this;

					classCallCheck(this, EventManager);


					world.eventManager = this;
					this.world = world;
					this.disable = false;
					this.isDeep = true;
					this.receivers = world.receivers;
					this.raycaster = new three.Raycaster();
					this.centerRaycaster = new three.Raycaster();
					this.selectedObj = null;
					this.centerSelectedObj = null;
					this.isDetectingEnter = true;
					var normalEventList = world.app.options.normalEventList;

					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
							for (var _iterator = normalEventList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
									var eventItem = _step.value;


									world.app.parent.addEventListener(eventItem, function (event) {

											if (_this.disable) return;
											_this.raycastCheck(_this.toNovaEvent(event));
									});
							}
					} catch (err) {
							_didIteratorError = true;
							_iteratorError = err;
					} finally {
							try {
									if (!_iteratorNormalCompletion && _iterator.return) {
											_iterator.return();
									}
							} finally {
									if (_didIteratorError) {
											throw _iteratorError;
									}
							}
					}

					try {

							if (window.Hammer === undefined) {

									return;
							}
					} catch (e) {

							console.warn('Hammer没有引入，手势事件无法使用，只能使用基础的交互事件。');
							return;
					}
					this.hammer = new window.Hammer(world.app.renderer.domElement);
					this.hammer.on(world.app.options.hammerEventList, function (event) {

							if (_this.disable) return;
							_this.raycastCheck(event);
					});
			}

			createClass(EventManager, [{
					key: "toNovaEvent",
					value: function toNovaEvent(event) {

							return {
									changedPointers: [event],
									center: new three.Vector2(event.clientX, event.clientY),
									type: event.type,
									target: event.target
							};
					}
			}, {
					key: "raycastCheck",
					value: function raycastCheck(event) {

							var vec2 = new three.Vector2(event.center.x / this.world.app.getWorldWidth() * 2 - 1, 1 - event.center.y / this.world.app.getWorldHeight() * 2);
							this.raycaster.setFromCamera(vec2, this.world.camera);
							var receiverMap = void 0;
							if (this.world.receivers instanceof Array) {

									receiverMap = new Map();
									receiverMap.set(Symbol(), this.world.receivers);
							} else if (this.world.receivers instanceof Map) {

									receiverMap = this.world.receivers;
							}
							var intersect = void 0;
							var _iteratorNormalCompletion2 = true;
							var _didIteratorError2 = false;
							var _iteratorError2 = undefined;

							try {
									for (var _iterator2 = receiverMap.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
											var receivers = _step2.value;


											var intersects = this.raycaster.intersectObjects(receivers, this.isDeep);
											for (var i = 0; i < intersects.length; i++) {

													if (intersects[i].object.isPenetrated || !intersects[i].object.events || !intersects[i].object.events[event.type]) {

															continue;
													} else {

															intersect = intersects[i];
															break;
													}
											}
											if (intersect) {

													intersect.object.events[event.type].run(event, intersect);
											}
											return intersect;
									}
							} catch (err) {
									_didIteratorError2 = true;
									_iteratorError2 = err;
							} finally {
									try {
											if (!_iteratorNormalCompletion2 && _iterator2.return) {
													_iterator2.return();
											}
									} finally {
											if (_didIteratorError2) {
													throw _iteratorError2;
											}
									}
							}
					}
			}]);
			return EventManager;
	}();

	var World = function () {
		function World(app, camera, clearColor) {
			var _this = this;

			classCallCheck(this, World);


			this.app = app;
			this.scene = new three.Scene();
			this.logicLoop = new LoopManager();
			this.renderLoop = new LoopManager();
			this.camera = camera || new three.PerspectiveCamera(45, app.getWorldWidth() / app.getWorldHeight(), 0.01, 5000);
			this.receivers = this.scene.children;
			this.eventManager = new EventManager(this);
			this.renderTargetParameters = {
				minFilter: three.LinearFilter,
				magFilter: three.LinearFilter,
				format: three.RGBFormat,
				stencilBuffer: false
			};
			this.isRTT = false;
			this.clearColor = clearColor || 0;
			this.fbo = new three.WebGLRenderTarget(this.app.getWorldWidth(), this.app.getWorldHeight(), this.renderTargetParameters);
			this.defaultRenderID = Symbol();
			this.renderLoop.add(function () {

				if (_this.isRTT) {

					_this.app.renderer.render(_this.scene, _this.camera, _this.fbo, true);
				} else {

					_this.app.renderer.render(_this.scene, _this.camera);
				}
			}, this.defaultRenderID);
			this.defaultUpdateID = Symbol();
		}

		createClass(World, [{
			key: 'update',
			value: function update(time) {

				this.logicLoop.update(time);
				this.renderLoop.update(time);
			}
		}, {
			key: 'resize',
			value: function resize(width, height) {

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
		}]);
		return World;
	}();

	var APP_STOP = 0;
	var APP_RUNNING = 1;
	var APP_PAUSE = 2;
	var VERSION = '0.1.3';

	console.log("Nova framework for Three.js, version: %c " + VERSION, "color:blue");

	var VR = function () {
		function VR(app) {
			classCallCheck(this, VR);


			this.app = app;
			this.display = undefined;
			this.polyfill = undefined;
			this.isOpenVR = false;
			this.vrEffect = undefined;
			this.getVRDisplay();
			this.createVREffect();
		}

		createClass(VR, [{
			key: "createVREffect",
			value: function createVREffect() {

				if (this.vrEffect) {

					return;
				}
				if (!window.THREE.VREffect) {

					console.warn("未引入VREffect.js，无法创建VR模式。");
					return;
				}
				this.vrEffect = new window.THREE.VREffect(this.app.renderer);
				this.vrEffect.setSize(this.app.renderer.domElement.clientWidth, this.app.renderer.domElement.clientHeight, false);
				this.vrEffect.isOpened = false;
				this.vrEffect.updateId = Symbol();
			}
		}, {
			key: "setPolyfill",
			value: function setPolyfill() {

				if (this.polyfill) {

					return;
				}
				if (!window.WebVRPolyfill) {

					console.warn("未引入WebVRPolyfill.js，无法创建VR兼容模式。");
					return;
				}
				var config = function () {

					var config = {};
					var q = window.location.search.substring(1);
					if (q === '') {

						return config;
					}
					var params = q.split('&');
					var param = void 0,
					    name = void 0,
					    value = void 0;
					for (var i = 0; i < params.length; i++) {

						param = params[i].split('=');
						name = param[0];
						value = param[1];

						// All config values are either boolean or float
						config[name] = value === 'true' ? true : value === 'false' ? false : parseFloat(value);
					}
					return config;
				}();
				this.polyfill = new window.WebVRPolyfill(config);
			}
		}, {
			key: "getVRDisplay",
			value: function getVRDisplay() {
				var _this = this;

				if (!navigator.getVRDisplays) {

					this.setPolyfill();
				}
				if (!navigator.getVRDisplays) {

					return;
				}
				return navigator.getVRDisplays().then(function (vrDisplays) {

					if (vrDisplays.length) {

						_this.display = vrDisplays[0];
						return _this.display;
					}
					return "no";
				}, function () {

					return "no";
				});
			}
		}, {
			key: "open",
			value: function open() {
				var _this2 = this;

				if (!this.display || !this.vrEffect) {

					console.warn("未发现VR设备或浏览器不兼容，无法进入VR模式。");
					return;
				}
				this.app.renderLoop.add(function () {

					_this2.vrEffect.render(_this2.app.world.scene, _this2.app.world.camera);
				}, this.vrEffect.updateId);
				this.display.requestPresent([{ source: this.app.renderer.domElement }]);
			}
		}, {
			key: "close",
			value: function close() {

				this.app.renderLoop.remove(this.vrEffect.updateId);
			}
		}]);
		return VR;
	}();

	var App = function () {
			function App() {
					var _this = this;

					var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
					classCallCheck(this, App);


					this.options = lodash.defaultsDeep(settings, DefaultSettings);
					if (this.options.setCommonCSS) {

							this.setCommonCSS();
					}
					this.parent = this.options.parent;
					this.renderer = new three.WebGLRenderer({
							antialias: this.options.renderer.antialias,
							precision: this.options.renderer.precision,
							alpha: this.options.renderer.alpha,
							logarithmicDepthBuffer: this.options.renderer.logarithmicDepthBuffer,
							preserveDrawingBuffer: this.options.renderer.preserveDrawingBuffer
					});
					this.renderer.setClearColor(this.options.renderer.clearColor, this.options.renderer.clearAlpha);
					this.world = new World(this);

					this.state = APP_STOP;
					this.logicLoop = new LoopManager();
					this.renderLoop = new LoopManager();
					window.addEventListener('resize', function () {

							_this.resize();
					});
					if (this.options.autoStart) {

							this.start();
					}
					if (this.options.VRSupport) {

							this.VR = new VR(this);
					}
			}

			createClass(App, [{
					key: 'resize',
					value: function resize() {

							var width = this.getWorldWidth();
							var height = this.getWorldHeight();
							this.world.resize(width, height);
							this.renderer.setSize(width, height);
							this.renderer.setPixelRatio(this.options.renderer.pixelRatio);
					}
			}, {
					key: 'update',
					value: function update(time) {
							var _this2 = this;

							if (this.state === APP_RUNNING) {

									this.logicLoop.update(time);
									this.world.update(time);
									this.renderLoop.update(time);
							}

							requestAnimationFrame(function () {

									_this2.update();
							});
					}
			}, {
					key: 'setCommonCSS',
					value: function setCommonCSS() {

							document.write('<style>*{margin:0;padding:0} body{overflow:hidden}</style>');
					}
			}, {
					key: 'getWorldWidth',
					value: function getWorldWidth() {

							return this.parent === document.body ? window.innerWidth : this.parent.offsetWidth;
					}
			}, {
					key: 'getWorldHeight',
					value: function getWorldHeight() {

							return this.parent === document.body ? window.innerHeight : this.parent.offsetHeight;
					}
			}, {
					key: 'start',
					value: function start() {

							if (this.state === APP_STOP) {

									this.state = APP_RUNNING;
									this.parent.appendChild(this.renderer.domElement);
									this.resize();
									this.update();
							}
					}
			}, {
					key: 'resume',
					value: function resume() {

							if (this.state === APP_PAUSE) {

									this.state = APP_RUNNING;
							}
					}
			}, {
					key: 'pause',
					value: function pause() {

							if (this.state === APP_RUNNING) {

									this.state = APP_PAUSE;
							}
					}
			}, {
					key: 'destroy',
					value: function destroy() {

							this.world.destroy();
					}
			}, {
					key: 'openFullScreen',
					value: function openFullScreen() {

							var container = this.parent;
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
			}, {
					key: 'closeFullScreen',
					value: function closeFullScreen() {

							var container = document;
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
			}, {
					key: 'toggleFullScreen',
					value: function toggleFullScreen() {

							if (this.isFullScreen) {

									this.closeFullScreen();
							} else {

									this.openFullScreen();
							}
					}
			}, {
					key: 'screenshot',
					value: function screenshot() {

							var img = new Image();
							this.renderer.render(this.world.scene, this.world.camera);
							img.src = this.renderer.domElement.toDataURL();
							var w = window.open('', '');
							w.document.title = "Nova Screenshot";
							w.document.body.appendChild(img);
					}
			}, {
					key: 'sceneCoordinateToCanvasCoordinate',
					value: function sceneCoordinateToCanvasCoordinate(obj) {
							var camera = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.world.camera;


							var worldVector = obj instanceof three.Vector3 ? obj.clone() : obj.position.clone();
							var vector = worldVector.project(camera);
							var halfWidth = this.getWorldWidth() / 2;
							var halfHeight = this.getWorldHeight() / 2;

							return new three.Vector2(Math.round(vector.x * halfWidth + halfWidth), Math.round(-vector.y * halfHeight + halfHeight));
					}
			}]);
			return App;
	}();

	var Bind = function () {
		function Bind(obj) {
			classCallCheck(this, Bind);


			for (var i in obj) {

				this[i] = obj[i];
				this.bindMap = new Map();
				this.defineReactive(this, i, this[i]);
			}
		}

		createClass(Bind, [{
			key: "add",
			value: function add(obj) {
				var funcs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


				this.bindMap.set(obj, funcs);
			}
		}, {
			key: "remove",
			value: function remove(obj) {

				this.bindMap.delete(obj);
			}
		}, {
			key: "defineReactive",
			value: function defineReactive(data, key, val) {

				Object.defineProperty(data, key, {
					enumerable: true,
					configurable: false,
					get: function get$$1() {

						return val;
					},
					set: function set$$1(newVal) {

						val = newVal;
						var bindMap = data.bindMap;
						var _iteratorNormalCompletion = true;
						var _didIteratorError = false;
						var _iteratorError = undefined;

						try {
							for (var _iterator = bindMap[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
								var _step$value = slicedToArray(_step.value, 2),
								    obj = _step$value[0],
								    funcs = _step$value[1];

								if (obj[key] !== undefined) {

									obj[key] = funcs[key] ? funcs[key](val, obj) : val;
								}
							}
						} catch (err) {
							_didIteratorError = true;
							_iteratorError = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion && _iterator.return) {
									_iterator.return();
								}
							} finally {
								if (_didIteratorError) {
									throw _iteratorError;
								}
							}
						}
					}
				});
			}
		}]);
		return Bind;
	}();

	var FBOWorld = function () {
		function FBOWorld(app, camera, width, height) {
			var _this = this;

			classCallCheck(this, FBOWorld);


			this.width = width;
			this.height = height;
			this.app = app;
			this.scene = new three.Scene();
			this.logicLoop = new LoopManager();
			this.renderLoop = new LoopManager();
			this.camera = camera || new three.PerspectiveCamera(45, this.width / this.height, 0.01, 5000);
			this.receivers = this.scene.children;

			this.renderTargetParameters = {
				minFilter: three.LinearFilter,
				magFilter: three.LinearFilter,
				format: three.RGBFormat,
				stencilBuffer: false
			};
			this.clearColor = 0;
			this.fbo = new three.WebGLRenderTarget(this.width, this.height, this.renderTargetParameters);
			this.defaultRenderID = Symbol();
			this.defaultUpdateID = Symbol();
			this.resize();
			this.renderLoop.add(function () {

				_this.app.renderer.render(_this.scene, _this.camera, _this.fbo, true);
			}, this.defaultRenderID);
		}

		createClass(FBOWorld, [{
			key: 'update',
			value: function update(time) {

				this.logicLoop.update(time);
				this.renderLoop.update(time);
			}
		}, {
			key: 'resize',
			value: function resize() {

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
		}]);
		return FBOWorld;
	}();

	var Monitor = function () {
		function Monitor(world, option) {
			classCallCheck(this, Monitor);


			this.option = option;
			this.fullWidth = world.app.getWorldWidth();
			this.fullHeight = world.app.getWorldHeight();
			this.renderer = new three.WebGLRenderer();
			this.world = world;
			this.canvas = this.renderer.domElement;
			this.renderer.setSize(this.fullWidth * option.width, this.fullHeight * option.height);
			this.renderer.setPixelRatio(window.devicePixelRatio);
		}

		createClass(Monitor, [{
			key: "resize",
			value: function resize(option) {

				this.option = option;
				this.fullWidth = this.world.app.getWorldWidth();
				this.fullHeight = this.world.app.getWorldHeight();
				this.renderer.setSize(this.fullWidth * option.width, this.fullHeight * option.height);
				this.setViewOffset();
			}
		}, {
			key: "setViewOffset",
			value: function setViewOffset() {

				var viewX = this.fullWidth * this.option.left;
				var viewY = this.fullHeight * this.option.top;
				var viewWidth = this.fullWidth * this.option.width;
				var viewHeight = this.fullHeight * this.option.height;
				this.world.camera.setViewOffset(this.fullWidth, this.fullHeight, viewX, viewY, viewWidth, viewHeight);
			}
		}, {
			key: "render",
			value: function render() {

				this.setViewOffset();
				this.renderer.render(this.world.scene, this.world.camera);
			}
		}]);
		return Monitor;
	}();

	var QRMode = {
		MODE_NUMBER: 1 << 0,
		MODE_ALPHA_NUM: 1 << 1,
		MODE_8BIT_BYTE: 1 << 2,
		MODE_KANJI: 1 << 3
	};

	var QR8bitByte = function () {
		function QR8bitByte(data) {
			classCallCheck(this, QR8bitByte);


			this.mode = QRMode.MODE_8BIT_BYTE;
			this.data = data;
			this.parsedData = [];

			for (var i = 0, l = this.data.length; i < l; i++) {

				var byteArray = [];
				var code = this.data.charCodeAt(i);

				if (code > 0x10000) {

					byteArray[0] = 0xF0 | (code & 0x1C0000) >>> 18;
					byteArray[1] = 0x80 | (code & 0x3F000) >>> 12;
					byteArray[2] = 0x80 | (code & 0xFC0) >>> 6;
					byteArray[3] = 0x80 | code & 0x3F;
				} else if (code > 0x800) {

					byteArray[0] = 0xE0 | (code & 0xF000) >>> 12;
					byteArray[1] = 0x80 | (code & 0xFC0) >>> 6;
					byteArray[2] = 0x80 | code & 0x3F;
				} else if (code > 0x80) {

					byteArray[0] = 0xC0 | (code & 0x7C0) >>> 6;
					byteArray[1] = 0x80 | code & 0x3F;
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

		createClass(QR8bitByte, [{
			key: "getLength",
			value: function getLength() {

				return this.parsedData.length;
			}
		}, {
			key: "write",
			value: function write(buffer) {

				for (var i = 0, l = this.parsedData.length; i < l; i++) {

					buffer.put(this.parsedData[i], 8);
				}
			}
		}]);
		return QR8bitByte;
	}();

	var QRCodeModel = function () {
		function QRCodeModel(typeNumber, errorCorrectLevel) {
			classCallCheck(this, QRCodeModel);


			this.typeNumber = typeNumber;
			this.errorCorrectLevel = errorCorrectLevel;
			this.modules = undefined;
			this.moduleCount = 0;
			this.dataCache = undefined;
			this.dataList = [];
		}

		createClass(QRCodeModel, [{
			key: "addData",
			value: function addData(data) {

				var newData = new QR8bitByte(data);
				this.dataList.push(newData);
				this.dataCache = undefined;
			}
		}, {
			key: "isDark",
			value: function isDark(row, col) {

				if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {

					throw new Error(row + "," + col);
				}
				return this.modules[row][col];
			}
		}, {
			key: "getModuleCount",
			value: function getModuleCount() {

				return this.moduleCount;
			}
		}, {
			key: "make",
			value: function make() {

				this.makeImpl(false, this.getBestMaskPattern());
			}
		}, {
			key: "makeImpl",
			value: function makeImpl(test, maskPattern) {

				this.moduleCount = this.typeNumber * 4 + 17;
				this.modules = new Array(this.moduleCount);
				for (var row = 0; row < this.moduleCount; row++) {

					this.modules[row] = new Array(this.moduleCount);
					for (var col = 0; col < this.moduleCount; col++) {

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

					this.dataCache = QRCodeModel.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
				}
				this.mapData(this.dataCache, maskPattern);
			}
		}, {
			key: "setupPositionProbePattern",
			value: function setupPositionProbePattern(row, col) {

				for (var r = -1; r <= 7; r++) {

					if (row + r <= -1 || this.moduleCount <= row + r) continue;
					for (var c = -1; c <= 7; c++) {

						if (col + c <= -1 || this.moduleCount <= col + c) continue;
						if (0 <= r && r <= 6 && (c === 0 || c === 6) || 0 <= c && c <= 6 && (r === 0 || r === 6) || 2 <= r && r <= 4 && 2 <= c && c <= 4) {

							this.modules[row + r][col + c] = true;
						} else {

							this.modules[row + r][col + c] = false;
						}
					}
				}
			}
		}, {
			key: "getBestMaskPattern",
			value: function getBestMaskPattern() {

				var minLostPoint = 0;
				var pattern = 0;
				for (var i = 0; i < 8; i++) {

					this.makeImpl(true, i);
					var lostPoint = QRUtil.getLostPoint(this);
					if (i === 0 || minLostPoint > lostPoint) {

						minLostPoint = lostPoint;
						pattern = i;
					}
				}
				return pattern;
			}
		}, {
			key: "createMovieClip",
			value: function createMovieClip(target_mc, instance_name, depth) {

				var qr_mc = target_mc.createEmptyMovieClip(instance_name, depth);
				var cs = 1;
				this.make();
				for (var row = 0; row < this.modules.length; row++) {

					var y = row * cs;
					for (var col = 0; col < this.modules[row].length; col++) {

						var x = col * cs;
						var dark = this.modules[row][col];
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
		}, {
			key: "setupTimingPattern",
			value: function setupTimingPattern() {

				for (var r = 8; r < this.moduleCount - 8; r++) {

					if (this.modules[r][6] !== undefined) {

						continue;
					}
					this.modules[r][6] = r % 2 === 0;
				}
				for (var c = 8; c < this.moduleCount - 8; c++) {

					if (this.modules[6][c] !== undefined) {

						continue;
					}
					this.modules[6][c] = c % 2 === 0;
				}
			}
		}, {
			key: "setupPositionAdjustPattern",
			value: function setupPositionAdjustPattern() {

				var pos = QRUtil.getPatternPosition(this.typeNumber);
				for (var i = 0; i < pos.length; i++) {

					for (var j = 0; j < pos.length; j++) {

						var row = pos[i];
						var col = pos[j];
						if (this.modules[row][col] !== undefined) {

							continue;
						}
						for (var r = -2; r <= 2; r++) {

							for (var c = -2; c <= 2; c++) {

								if (r === -2 || r === 2 || c === -2 || c === 2 || r === 0 && c == 0) {

									this.modules[row + r][col + c] = true;
								} else {

									this.modules[row + r][col + c] = false;
								}
							}
						}
					}
				}
			}
		}, {
			key: "setupTypeNumber",
			value: function setupTypeNumber(test) {

				var bits = QRUtil.getBCHTypeNumber(this.typeNumber);
				for (var i = 0; i < 18; i++) {

					var mod = !test && (bits >> i & 1) === 1;
					this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
				}
				for (var _i = 0; _i < 18; _i++) {

					var _mod = !test && (bits >> _i & 1) === 1;
					this.modules[_i % 3 + this.moduleCount - 8 - 3][Math.floor(_i / 3)] = _mod;
				}
			}
		}, {
			key: "setupTypeInfo",
			value: function setupTypeInfo(test, maskPattern) {

				var data = this.errorCorrectLevel << 3 | maskPattern;
				var bits = QRUtil.getBCHTypeInfo(data);
				for (var i = 0; i < 15; i++) {

					var mod = !test && (bits >> i & 1) === 1;
					if (i < 6) {

						this.modules[i][8] = mod;
					} else if (i < 8) {

						this.modules[i + 1][8] = mod;
					} else {

						this.modules[this.moduleCount - 15 + i][8] = mod;
					}
				}
				for (var _i2 = 0; _i2 < 15; _i2++) {

					var _mod2 = !test && (bits >> _i2 & 1) === 1;
					if (_i2 < 8) {

						this.modules[8][this.moduleCount - _i2 - 1] = _mod2;
					} else if (_i2 < 9) {

						this.modules[8][15 - _i2 - 1 + 1] = _mod2;
					} else {

						this.modules[8][15 - _i2 - 1] = _mod2;
					}
				}
				this.modules[this.moduleCount - 8][8] = !test;
			}
		}, {
			key: "mapData",
			value: function mapData(data, maskPattern) {

				var inc = -1;
				var row = this.moduleCount - 1;
				var bitIndex = 7;
				var byteIndex = 0;
				for (var col = this.moduleCount - 1; col > 0; col -= 2) {

					if (col === 6) col--;
					while (true) {

						for (var c = 0; c < 2; c++) {

							if (this.modules[row][col - c] === undefined) {

								var dark = false;
								if (byteIndex < data.length) {

									dark = (data[byteIndex] >>> bitIndex & 1) === 1;
								}
								var mask = QRUtil.getMask(maskPattern, row, col - c);
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
		}]);
		return QRCodeModel;
	}();

	QRCodeModel.PAD0 = 0xEC;
	QRCodeModel.PAD1 = 0x11;
	QRCodeModel.createData = function (typeNumber, errorCorrectLevel, dataList) {

		var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
		var buffer = new QRBitBuffer();
		for (var i = 0; i < dataList.length; i++) {

			var data = dataList[i];
			buffer.put(data.mode, 4);
			buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber));
			data.write(buffer);
		}
		var totalDataCount = 0;
		for (var _i3 = 0; _i3 < rsBlocks.length; _i3++) {

			totalDataCount += rsBlocks[_i3].dataCount;
		}
		if (buffer.getLengthInBits() > totalDataCount * 8) {

			throw new Error("code length overflow. (" + buffer.getLengthInBits() + ">" + totalDataCount * 8 + ")");
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
	QRCodeModel.createBytes = function (buffer, rsBlocks) {

		var offset = 0;
		var maxDcCount = 0;
		var maxEcCount = 0;
		var dcdata = new Array(rsBlocks.length);
		var ecdata = new Array(rsBlocks.length);
		for (var r = 0; r < rsBlocks.length; r++) {

			var dcCount = rsBlocks[r].dataCount;
			var ecCount = rsBlocks[r].totalCount - dcCount;
			maxDcCount = Math.max(maxDcCount, dcCount);
			maxEcCount = Math.max(maxEcCount, ecCount);
			dcdata[r] = new Array(dcCount);
			for (var i = 0; i < dcdata[r].length; i++) {

				dcdata[r][i] = 0xff & buffer.buffer[i + offset];
			}
			offset += dcCount;
			var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
			var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
			var modPoly = rawPoly.mod(rsPoly);
			ecdata[r] = new Array(rsPoly.getLength() - 1);
			for (var _i4 = 0; _i4 < ecdata[r].length; _i4++) {

				var modIndex = _i4 + modPoly.getLength() - ecdata[r].length;
				ecdata[r][_i4] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
			}
		}
		var totalCodeCount = 0;
		for (var _i5 = 0; _i5 < rsBlocks.length; _i5++) {

			totalCodeCount += rsBlocks[_i5].totalCount;
		}
		var data = new Array(totalCodeCount);
		var index = 0;
		for (var _i6 = 0; _i6 < maxDcCount; _i6++) {

			for (var _r = 0; _r < rsBlocks.length; _r++) {

				if (_i6 < dcdata[_r].length) {

					data[index++] = dcdata[_r][_i6];
				}
			}
		}
		for (var _i7 = 0; _i7 < maxEcCount; _i7++) {

			for (var _r2 = 0; _r2 < rsBlocks.length; _r2++) {

				if (_i7 < ecdata[_r2].length) {

					data[index++] = ecdata[_r2][_i7];
				}
			}
		}
		return data;
	};

	var QRErrorCorrectLevel = {
		L: 1,
		M: 0,
		Q: 3,
		H: 2
	};
	var QRMaskPattern = {
		PATTERN000: 0,
		PATTERN001: 1,
		PATTERN010: 2,
		PATTERN011: 3,
		PATTERN100: 4,
		PATTERN101: 5,
		PATTERN110: 6,
		PATTERN111: 7
	};
	var QRUtil = {
		PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]],
		G15: 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0,
		G18: 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0,
		G15_MASK: 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1,
		getBCHTypeInfo: function getBCHTypeInfo(data) {

			var d = data << 10;
			while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {

				d ^= QRUtil.G15 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15);
			}
			return (data << 10 | d) ^ QRUtil.G15_MASK;
		},
		getBCHTypeNumber: function getBCHTypeNumber(data) {

			var d = data << 12;
			while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {

				d ^= QRUtil.G18 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18);
			}
			return data << 12 | d;
		},
		getBCHDigit: function getBCHDigit(data) {

			var digit = 0;
			while (data !== 0) {

				digit++;
				data >>>= 1;
			}
			return digit;
		},
		getPatternPosition: function getPatternPosition(typeNumber) {

			return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
		},
		getMask: function getMask(maskPattern, i, j) {

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
					return i * j % 2 + i * j % 3 === 0;
				case QRMaskPattern.PATTERN110:
					return (i * j % 2 + i * j % 3) % 2 === 0;
				case QRMaskPattern.PATTERN111:
					return (i * j % 3 + (i + j) % 2) % 2 === 0;
				default:
					throw new Error("bad maskPattern:" + maskPattern);

			}
		},
		getErrorCorrectPolynomial: function getErrorCorrectPolynomial(errorCorrectLength) {

			var a = new QRPolynomial([1], 0);
			for (var i = 0; i < errorCorrectLength; i++) {

				a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
			}
			return a;
		},
		getLengthInBits: function getLengthInBits(mode, type) {

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
		getLostPoint: function getLostPoint(qrCode) {

			var moduleCount = qrCode.getModuleCount();
			var lostPoint = 0;
			for (var row = 0; row < moduleCount; row++) {

				for (var col = 0; col < moduleCount; col++) {

					var sameCount = 0;
					var dark = qrCode.isDark(row, col);
					for (var r = -1; r <= 1; r++) {

						if (row + r < 0 || moduleCount <= row + r) {

							continue;
						}
						for (var c = -1; c <= 1; c++) {

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

						lostPoint += 3 + sameCount - 5;
					}
				}
			}
			for (var _row = 0; _row < moduleCount - 1; _row++) {

				for (var _col = 0; _col < moduleCount - 1; _col++) {

					var count = 0;
					if (qrCode.isDark(_row, _col)) count++;
					if (qrCode.isDark(_row + 1, _col)) count++;
					if (qrCode.isDark(_row, _col + 1)) count++;
					if (qrCode.isDark(_row + 1, _col + 1)) count++;
					if (count === 0 || count === 4) {

						lostPoint += 3;
					}
				}
			}
			for (var _row2 = 0; _row2 < moduleCount; _row2++) {

				for (var _col2 = 0; _col2 < moduleCount - 6; _col2++) {

					if (qrCode.isDark(_row2, _col2) && !qrCode.isDark(_row2, _col2 + 1) && qrCode.isDark(_row2, _col2 + 2) && qrCode.isDark(_row2, _col2 + 3) && qrCode.isDark(_row2, _col2 + 4) && !qrCode.isDark(_row2, _col2 + 5) && qrCode.isDark(_row2, _col2 + 6)) {

						lostPoint += 40;
					}
				}
			}
			for (var _col3 = 0; _col3 < moduleCount; _col3++) {

				for (var _row3 = 0; _row3 < moduleCount - 6; _row3++) {

					if (qrCode.isDark(_row3, _col3) && !qrCode.isDark(_row3 + 1, _col3) && qrCode.isDark(_row3 + 2, _col3) && qrCode.isDark(_row3 + 3, _col3) && qrCode.isDark(_row3 + 4, _col3) && !qrCode.isDark(_row3 + 5, _col3) && qrCode.isDark(_row3 + 6, _col3)) {

						lostPoint += 40;
					}
				}
			}
			var darkCount = 0;
			for (var _col4 = 0; _col4 < moduleCount; _col4++) {

				for (var _row4 = 0; _row4 < moduleCount; _row4++) {

					if (qrCode.isDark(_row4, _col4)) {

						darkCount++;
					}
				}
			}
			var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
			lostPoint += ratio * 10;
			return lostPoint;
		}
	};
	var QRMath = {
		glog: function glog(n) {

			if (n < 1) {

				throw new Error("glog(" + n + ")");
			}
			return QRMath.LOG_TABLE[n];
		},
		gexp: function gexp(n) {

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
	for (var i = 0; i < 8; i++) {

		QRMath.EXP_TABLE[i] = 1 << i;
	}
	for (var _i8 = 8; _i8 < 256; _i8++) {

		QRMath.EXP_TABLE[_i8] = QRMath.EXP_TABLE[_i8 - 4] ^ QRMath.EXP_TABLE[_i8 - 5] ^ QRMath.EXP_TABLE[_i8 - 6] ^ QRMath.EXP_TABLE[_i8 - 8];
	}
	for (var _i9 = 0; _i9 < 255; _i9++) {

		QRMath.LOG_TABLE[QRMath.EXP_TABLE[_i9]] = _i9;
	}

	function QRPolynomial(num, shift) {

		if (num.length === undefined) {

			throw new Error(num.length + "/" + shift);
		}
		var offset = 0;
		while (offset < num.length && num[offset] === 0) {

			offset++;
		}
		this.num = new Array(num.length - offset + shift);
		for (var _i10 = 0; _i10 < num.length - offset; _i10++) {

			this.num[_i10] = num[_i10 + offset];
		}
	}
	QRPolynomial.prototype = {
		get: function get$$1(index) {

			return this.num[index];
		},
		getLength: function getLength() {

			return this.num.length;
		},
		multiply: function multiply(e) {

			var num = new Array(this.getLength() + e.getLength() - 1);
			for (var _i11 = 0; _i11 < this.getLength(); _i11++) {

				for (var j = 0; j < e.getLength(); j++) {

					num[_i11 + j] ^= QRMath.gexp(QRMath.glog(this.get(_i11)) + QRMath.glog(e.get(j)));
				}
			}
			return new QRPolynomial(num, 0);
		},
		mod: function mod(e) {

			if (this.getLength() - e.getLength() < 0) {

				return this;
			}
			var ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
			var num = new Array(this.getLength());
			for (var _i12 = 0; _i12 < this.getLength(); _i12++) {

				num[_i12] = this.get(_i12);
			}
			for (var _i13 = 0; _i13 < e.getLength(); _i13++) {

				num[_i13] ^= QRMath.gexp(QRMath.glog(e.get(_i13)) + ratio);
			}
			return new QRPolynomial(num, 0).mod(e);
		}
	};

	function QRRSBlock(totalCount, dataCount) {

		this.totalCount = totalCount;
		this.dataCount = dataCount;
	}
	QRRSBlock.RS_BLOCK_TABLE = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]];
	QRRSBlock.getRSBlocks = function (typeNumber, errorCorrectLevel) {

		var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
		if (rsBlock === undefined) {

			throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
		}
		var length = rsBlock.length / 3;
		var list = [];
		for (var _i14 = 0; _i14 < length; _i14++) {

			var count = rsBlock[_i14 * 3 + 0];
			var totalCount = rsBlock[_i14 * 3 + 1];
			var dataCount = rsBlock[_i14 * 3 + 2];
			for (var j = 0; j < count; j++) {

				list.push(new QRRSBlock(totalCount, dataCount));
			}
		}
		return list;
	};
	QRRSBlock.getRsBlockTable = function (typeNumber, errorCorrectLevel) {

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
		get: function get$$1(index) {

			var bufIndex = Math.floor(index / 8);
			return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) === 1;
		},
		put: function put(num, length) {

			for (var _i15 = 0; _i15 < length; _i15++) {

				this.putBit((num >>> length - _i15 - 1 & 1) === 1);
			}
		},
		getLengthInBits: function getLengthInBits() {

			return this.length;
		},
		putBit: function putBit(bit) {

			var bufIndex = Math.floor(this.length / 8);
			if (this.buffer.length <= bufIndex) {

				this.buffer.push(0);
			}
			if (bit) {

				this.buffer[bufIndex] |= 0x80 >>> this.length % 8;
			}
			this.length++;
		}
	};
	var QRCodeLimitLength = [[17, 14, 11, 7], [32, 26, 20, 14], [53, 42, 32, 24], [78, 62, 46, 34], [106, 84, 60, 44], [134, 106, 74, 58], [154, 122, 86, 64], [192, 152, 108, 84], [230, 180, 130, 98], [271, 213, 151, 119], [321, 251, 177, 137], [367, 287, 203, 155], [425, 331, 241, 177], [458, 362, 258, 194], [520, 412, 292, 220], [586, 450, 322, 250], [644, 504, 364, 280], [718, 560, 394, 310], [792, 624, 442, 338], [858, 666, 482, 382], [929, 711, 509, 403], [1003, 779, 565, 439], [1091, 857, 611, 461], [1171, 911, 661, 511], [1273, 997, 715, 535], [1367, 1059, 751, 593], [1465, 1125, 805, 625], [1528, 1190, 868, 658], [1628, 1264, 908, 698], [1732, 1370, 982, 742], [1840, 1452, 1030, 790], [1952, 1538, 1112, 842], [2068, 1628, 1168, 898], [2188, 1722, 1228, 958], [2303, 1809, 1283, 983], [2431, 1911, 1351, 1051], [2563, 1989, 1423, 1093], [2699, 2099, 1499, 1139], [2809, 2213, 1579, 1219], [2953, 2331, 1663, 1273]];

	/**
	 * Get the type by string length
	 *
	 * @private
	 * @param {String} sText
	 * @param {Number} nCorrectLevel
	 * @return {Number} type
	 */
	function _getTypeNumber(sText, nCorrectLevel) {

		var nType = 1;
		var length = _getUTF8Length(sText);

		for (var _i16 = 0, len = QRCodeLimitLength.length; _i16 <= len; _i16++) {

			var nLimit = 0;

			switch (nCorrectLevel) {

				case QRErrorCorrectLevel.L:
					nLimit = QRCodeLimitLength[_i16][0];
					break;
				case QRErrorCorrectLevel.M:
					nLimit = QRCodeLimitLength[_i16][1];
					break;
				case QRErrorCorrectLevel.Q:
					nLimit = QRCodeLimitLength[_i16][2];
					break;
				case QRErrorCorrectLevel.H:
					nLimit = QRCodeLimitLength[_i16][3];
					break;
				default:
					nLimit = QRCodeLimitLength[_i16][1];

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

		var replacedText = encodeURI(sText).toString().replace(/\%[0-9a-fA-F]{2}/g, 'a');
		return replacedText.length + (replacedText.length !== sText ? 3 : 0);
	}

	var QRCode = function QRCode(str) {
		var correctLevel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : QRErrorCorrectLevel.H;


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
	QRCode.prototype.makeCode = function (sText) {

		var oQRCode = new QRCodeModel(_getTypeNumber(sText, this.correctLevel), this.correctLevel);
		oQRCode.addData(sText);
		oQRCode.make();
		this.size = oQRCode.moduleCount;
		this.data = oQRCode.modules;
	};

	/**
	 * @name QRCode.CorrectLevel
	 */
	QRCode.CorrectLevel = QRErrorCorrectLevel;

	var Transitioner = function () {
		function Transitioner(app, world, texture) {
			var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
			classCallCheck(this, Transitioner);


			this.options = lodash.defaults(options, {
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
			this.material = new three.ShaderMaterial({
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
				vertexShader: "varying vec2 vUv;\n        void main() {\n        vUv = vec2( uv.x, uv.y );\n        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n        }",
				fragmentShader: "uniform float mixRatio;\n        uniform sampler2D tDiffuse1;\n        uniform sampler2D tDiffuse2;\n        uniform sampler2D tMixTexture;\n        uniform int useTexture;\n        uniform float threshold;\n        varying vec2 vUv;\n        \n        void main() {\n\n        vec4 texel1 = texture2D( tDiffuse1, vUv );\n        vec4 texel2 = texture2D( tDiffuse2, vUv );\n\n        if (useTexture==1) {\n\n        vec4 transitionTexel = texture2D( tMixTexture, vUv );\n        float r = mixRatio * (1.0 + threshold * 2.0) - threshold;\n        float mixf=clamp((transitionTexel.r - r)*(1.0/threshold), 0.0, 1.0);\n\n        gl_FragColor = mix( texel1, texel2, mixf );\n        } else {\n\n        gl_FragColor = mix( texel2, texel1, mixRatio );\n\n        }\n        }"
			});
			var halfWidth = app.getWorldWidth() / 2;
			var halfHeight = app.getWorldHeight() / 2;
			this.world = new World(app, new three.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, -10, 10));

			var geometry = new three.PlaneBufferGeometry(halfWidth * 2, halfHeight * 2);

			var quad = new three.Mesh(geometry, this.material);
			this.world.scene.add(quad);

			this.sceneA = world;
			this.sceneB = app.world;

			this.material.uniforms.tDiffuse1.value = this.sceneA.fbo.texture;
			this.material.uniforms.tDiffuse2.value = this.sceneB.fbo.texture;

			this.needChange = false;
		}

		createClass(Transitioner, [{
			key: "setThreshold",
			value: function setThreshold(value) {

				this.material.uniforms.threshold.value = value;
			}
		}, {
			key: "useTexture",
			value: function useTexture(value) {

				this.material.uniforms.useTexture.value = value ? 1 : 0;
			}
		}, {
			key: "setTexture",
			value: function setTexture() {

				this.material.uniforms.tMixTexture.value = this.texture;
			}
		}, {
			key: "update",
			value: function update() {

				var value = Math.min(this.options.transition, 1);
				value = Math.max(value, 0);
				this.material.uniforms.mixRatio.value = value;
				this.app.renderer.setClearColor(this.sceneB.clearColor || 0);
				this.sceneB.update();
				this.app.renderer.render(this.sceneB.scene, this.sceneB.camera, this.sceneB.fbo, true);
				this.app.renderer.setClearColor(this.sceneA.clearColor || 0);
				this.sceneA.update();
				this.app.renderer.render(this.sceneA.scene, this.sceneA.camera, this.sceneA.fbo, true);
				this.app.renderer.render(this.world.scene, this.world.camera, null, true);
			}
		}]);
		return Transitioner;
	}();

	var View = function () {
		function View(world, camera, _ref) {
			var _ref$clearColor = _ref.clearColor,
			    clearColor = _ref$clearColor === undefined ? 0x000000 : _ref$clearColor,
			    _ref$top = _ref.top,
			    top = _ref$top === undefined ? 0 : _ref$top,
			    _ref$left = _ref.left,
			    left = _ref$left === undefined ? 0 : _ref$left,
			    _ref$width = _ref.width,
			    width = _ref$width === undefined ? 1 : _ref$width,
			    _ref$height = _ref.height,
			    height = _ref$height === undefined ? 1 : _ref$height;
			classCallCheck(this, View);


			this.world = world;
			this.scene = world.scene;
			this.worldWidth = world.app.getWorldWidth();
			this.worldHeight = world.app.getWorldHeight();
			this.renderer = world.app.renderer;
			this.camera = camera || three.PerspectiveCamera(45, this.worldWidth / this.worldHeight, 0.01, 1000);
			this.renderTargetParameters = {
				minFilter: three.LinearFilter,
				magFilter: three.LinearFilter,
				format: three.RGBFormat,
				stencilBuffer: false
			};
			this.isRTT = false;
			this.clearColor = clearColor;
			this.left = left;
			this.top = top;
			this.width = width;
			this.height = height;

			this.fbo = new three.WebGLRenderTarget(this.worldWidth * this.width, this.worldHeight * this.height, this.renderTargetParameters);

			this.resize();
		}

		createClass(View, [{
			key: "render",
			value: function render() {

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
		}, {
			key: "resize",
			value: function resize() {

				this.worldWidth = this.world.app.getWorldWidth();
				this.worldHeight = this.world.app.getWorldHeight();
				var width = Math.floor(this.worldWidth * this.width);
				var height = Math.floor(this.worldHeight * this.height);
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
		}]);
		return View;
	}();

	/**
	 * 用于事件处理
	 *
	 * */

	var Signal = function () {
		function Signal(type) {
			classCallCheck(this, Signal);


			this.type = type;
			this.functionArr = [];
		}

		createClass(Signal, [{
			key: 'add',
			value: function add(func) {

				if (typeof func !== 'function') {

					throw new NotFunctionError();
				} else {

					this.functionArr.push(func);
				}
			}
		}, {
			key: 'remove',
			value: function remove(func) {

				return lodash.remove(this.functionArr, function (n) {

					return n === func;
				});
			}
		}, {
			key: 'run',
			value: function run(event, intersect) {

				this.functionArr.forEach(function (func) {

					func(event, intersect);
				});
			}
		}]);
		return Signal;
	}();

	/**
	 * 由于事件处理
	 *
	 * */

	var Events = function Events(list) {
		classCallCheck(this, Events);


		list = list || ['press', 'tap', 'pressup', 'pan', 'swipe', 'click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'touchmove', 'mousemove'];
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var eventItem = _step.value;


				this[eventItem] = new Signal(eventItem);
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	};

	var FBOEventMapper = function () {
		function FBOEventMapper(fboWorld, mesh, faceIndexArr) {
			classCallCheck(this, FBOEventMapper);


			this.world = fboWorld;
			this.disable = false;
			this.isDeep = true;
			this.receivers = fboWorld.receivers;
			this.raycaster = new three.Raycaster();
			this.mesh = mesh;
			this.faceIndexArr = faceIndexArr || [];
		}

		createClass(FBOEventMapper, [{
			key: "dispatch",
			value: function dispatch(event, intersect) {

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
		}, {
			key: "toNovaEvent",
			value: function toNovaEvent(event) {

				return {
					changedPointers: [event],
					center: new three.Vector2(event.clientX, event.clientY),
					type: event.type,
					target: event.target
				};
			}
		}, {
			key: "raycastCheck",
			value: function raycastCheck(event, intersect) {

				var uv = intersect.uv;
				var vec2 = new three.Vector2(uv.x * 2 - 1, uv.y * 2 - 1);
				this.raycaster.setFromCamera(vec2, this.world.camera);
				intersect = undefined;

				var intersects = this.raycaster.intersectObjects(this.world.receivers, this.isDeep);
				for (var i = 0; i < intersects.length; i++) {

					if (intersects[i].object.isPenetrated) {

						continue;
					} else {

						intersect = intersects[i];
						break;
					}
				}

				if (intersect && intersect.object.events && intersect.object.events[event.type]) {

					intersect.object.events[event.type].run(event, intersect);
				}
				return intersect;
			}
		}]);
		return FBOEventMapper;
	}();

	var GUI = function (_Group) {
		inherits(GUI, _Group);

		function GUI() {
			classCallCheck(this, GUI);

			var _this = possibleConstructorReturn(this, (GUI.__proto__ || Object.getPrototypeOf(GUI)).call(this));

			_this.css = {
				backgroundColor: "rgba(0,0,0,0)",
				opacity: 1,
				width: 1,
				height: 1
			};

			return _this;
		}

		return GUI;
	}(three.Group);

	var Body = function (_GUI) {
		inherits(Body, _GUI);

		function Body(world, css) {
			classCallCheck(this, Body);

			var _this2 = possibleConstructorReturn(this, (Body.__proto__ || Object.getPrototypeOf(Body)).call(this));

			_this2.world = world;
			_this2.distanceFromCamera = 50;
			_this2.css = lodash.defaultsDeep(css || {}, _this2.css);
			_this2.canvas = document.createElement("canvas");
			var spriteMaterial = new three.SpriteMaterial({
				map: _this2.canvas,
				color: 0xffffff
			});
			_this2.element = new three.Sprite(spriteMaterial);
			_this2.vector = new three.Vector3();
			_this2.update();
			_this2.add(_this2.element);

			return _this2;
		}

		createClass(Body, [{
			key: "lockToScreen",
			value: function lockToScreen() {

				var c = this.world.camera;
				c.getWorldDirection(this.vector);
				this.rotation.set(c.rotation.x, c.rotation.y, c.rotation.z);
				this.position.set(c.position.x + this.vector.x * this.distanceFromCamera, c.position.y + this.vector.y * this.distanceFromCamera, c.position.z + this.vector.z * this.distanceFromCamera);
			}
		}, {
			key: "update",
			value: function update() {

				this.canvas.width = this.css.width;
				this.canvas.height = this.css.height;
				var ctx = this.canvas.getContext("2d");
				ctx.fillStyle = this.css.backgroundColor;
				ctx.fillRect(0, 0, this.css.width, this.css.height);
				var texture = new three.CanvasTexture(this.canvas);
				texture.generateMipmaps = false;
				texture.minFilter = three.LinearFilter;
				texture.magFilter = three.LinearFilter;
				var spriteMaterial = new three.SpriteMaterial({
					map: texture,
					color: 0xffffff
				});
				this.element.material.dispose();
				this.element.material = spriteMaterial;
				this.element.scale.set(this.css.width / 4, this.css.height / 4, 1);
			}
		}]);
		return Body;
	}(GUI);

	var Div = function (_GUI2) {
		inherits(Div, _GUI2);

		function Div(world, css) {
			classCallCheck(this, Div);

			var _this3 = possibleConstructorReturn(this, (Div.__proto__ || Object.getPrototypeOf(Div)).call(this));

			_this3.world = world;
			_this3.css = lodash.defaultsDeep(css || {}, _this3.css);
			_this3.canvas = document.createElement("canvas");
			var spriteMaterial = new three.SpriteMaterial({
				map: _this3.canvas,
				color: 0xffffff
			});
			_this3.element = new three.Sprite(spriteMaterial);
			_this3.vector = new three.Vector3();
			_this3.update();
			_this3.add(_this3.element);

			return _this3;
		}

		createClass(Div, [{
			key: "update",
			value: function update() {

				this.canvas.width = this.css.width;
				this.canvas.height = this.css.height;
				var ctx = this.canvas.getContext("2d");
				ctx.fillStyle = this.css.backgroundColor;
				ctx.fillRect(0, 0, this.css.width, this.css.height);
				var texture = new three.CanvasTexture(this.canvas);
				texture.generateMipmaps = false;
				texture.minFilter = three.LinearFilter;
				texture.magFilter = three.LinearFilter;
				var spriteMaterial = new three.SpriteMaterial({
					map: texture,
					color: 0xffffff
				});
				this.element.material.dispose();
				this.element.material = spriteMaterial;
				this.element.scale.set(this.css.width / 4, this.css.height / 4, 1);
			}
		}]);
		return Div;
	}(GUI);

	var Txt = function (_Mesh) {
		inherits(Txt, _Mesh);

		function Txt(text, css) {
			classCallCheck(this, Txt);


			css = lodash.defaultsDeep(css || {}, {
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
					z: 1
				}
			});
			var canvas = document.createElement("canvas");
			var material = new three.MeshBasicMaterial({
				transparent: true,
				needsUpdate: false,
				color: 0xffffff
			});

			var _this4 = possibleConstructorReturn(this, (Txt.__proto__ || Object.getPrototypeOf(Txt)).call(this, new three.PlaneBufferGeometry(css.width / 8, css.height / 8), material));

			_this4.text = text;
			_this4.canvas = canvas;
			_this4.css = css;
			_this4.update();

			return _this4;
		}

		createClass(Txt, [{
			key: "update",
			value: function update() {

				this.material.map.dispose();
				this.canvas.width = this.css.width;
				this.canvas.height = this.css.height;
				var ctx = this.canvas.getContext("2d");
				ctx.fillStyle = this.css.backgroundColor;
				ctx.fillRect(0, 0, this.css.width, this.css.height);
				ctx.textAlign = this.css.textAlign;
				ctx.font = this.css.fontStyle + " " + this.css.fontVariant + " " + this.css.fontWeight + " " + this.css.fontSize + "px " + this.css.fontFamily;
				ctx.fillStyle = this.css.color;
				// let width = ctx.measureText( this.text ).width;
				ctx.fillText(this.text, this.css.width / 2, this.css.height / 2 + this.css.fontSize / 4);
				var texture = new three.CanvasTexture(this.canvas);
				texture.generateMipmaps = false;
				texture.minFilter = three.LinearFilter;
				texture.magFilter = three.LinearFilter;
				this.material.map = texture;
				this.scale.set(this.css.scale.x, this.css.scale.y, this.css.scale.z);
				this.material.opacity = this.css.opacity;
			}
		}]);
		return Txt;
	}(three.Mesh);

	var LoaderFactory = function () {
			function LoaderFactory() {
					var _this = this;

					classCallCheck(this, LoaderFactory);


					this.manager = new three.LoadingManager();
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

					this.manager.onStart = function (url, itemsLoaded, itemsTotal) {

							if (_this.onStart && typeof _this.onStart === 'function') {

									_this.onStart(url, itemsLoaded, itemsTotal);
							}
					};

					this.manager.onLoad = function () {

							if (_this.onLoad && typeof _this.onLoad === 'function') {

									_this.onLoad();
							}
					};

					this.manager.onProgress = function (url, itemsLoaded, itemsTotal) {

							if (_this.onProgress && typeof _this.onProgress === 'function') {

									_this.onProgress(url, itemsLoaded, itemsTotal);
							}
					};

					this.manager.onError = function (url) {

							if (_this.onError && typeof _this.onError === 'function') {

									_this.onError(url);
							}
					};

					this.imageLoader = new three.ImageLoader(this.manager);
					this.textureLoader = new three.TextureLoader(this.manager);
					this.audioListener = new three.AudioListener(this.manager);
			}

			createClass(LoaderFactory, [{
					key: 'loadImage',
					value: function loadImage(key, src, sucFunc, errFunc) {
							var _this2 = this;

							return this.imageLoader.load(src, function (data) {

									_this2.Resource.images[key] = data;
									if (sucFunc) sucFunc(data);
							}, undefined, function (err) {

									_this2.Resource.unloaded.images.push(src);
									if (errFunc) errFunc(err);
							});
					}
			}, {
					key: 'loadTexture',
					value: function loadTexture(key, src, sucFunc, errFunc) {
							var _this3 = this;

							return this.textureLoader.load(src, function (data) {

									_this3.Resource.textures[key] = data;
									if (sucFunc) sucFunc(data);
							}, undefined, function (err) {

									_this3.Resource.unloaded.textures.push(src);
									if (errFunc) errFunc(err);
							});
					}
			}]);
			return LoaderFactory;
	}();

	var CopyShader = {
	  uniforms: {
	    'tDiffuse': { value: null },
	    'opacity': { value: 1.0 }
	  },

	  vertexShader: '\n    varying vec2 vUv;\n    void main() {\n      vUv = uv;\n      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n    }',

	  fragmentShader: '\n    uniform float opacity;\n    uniform sampler2D tDiffuse;\n    varying vec2 vUv;\n    void main() {\n      vec4 texel = texture2D( tDiffuse, vUv );\n      gl_FragColor = opacity * texel;\n    }'
	};

	var Pass = function () {
		function Pass(effectComposer) {
			var renderToScreen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
			classCallCheck(this, Pass);


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

		createClass(Pass, [{
			key: "setSize",
			value: function setSize() {} // width, height

		}, {
			key: "render",
			value: function render() {} // renderer, writeBuffer, readBuffer, delta, maskActive

		}]);
		return Pass;
	}();

	var ShaderPass = function (_Pass) {
			inherits(ShaderPass, _Pass);

			function ShaderPass(shader, effectComposer) {
					var renderToScreen = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
					var textureID = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "tDiffuse";
					classCallCheck(this, ShaderPass);

					var _this = possibleConstructorReturn(this, (ShaderPass.__proto__ || Object.getPrototypeOf(ShaderPass)).call(this, effectComposer, renderToScreen));

					_this.textureID = textureID;

					if (shader instanceof three.ShaderMaterial) {

							_this.uniforms = shader.uniforms;
							_this.material = shader;
					} else if (shader) {

							_this.uniforms = three.UniformsUtils.clone(shader.uniforms);
							_this.material = new three.ShaderMaterial({
									defines: shader.defines || {},
									uniforms: _this.uniforms,
									vertexShader: shader.vertexShader,
									fragmentShader: shader.fragmentShader
							});
					}

					_this.camera = new three.OrthographicCamera(-1, 1, 1, -1, 0, 1);
					_this.scene = new three.Scene();
					_this.quad = new three.Mesh(new three.PlaneBufferGeometry(2, 2), null);
					_this.quad.frustumCulled = false;
					_this.scene.add(_this.quad);

					return _this;
			}

			createClass(ShaderPass, [{
					key: "render",
					value: function render(renderer, writeBuffer, readBuffer) {

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
			}]);
			return ShaderPass;
	}(Pass);

	var RenderPass = function (_Pass) {
		inherits(RenderPass, _Pass);

		function RenderPass(scene, camera, overrideMaterial, clearColor) {
			var clearAlpha = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
			classCallCheck(this, RenderPass);

			var _this = possibleConstructorReturn(this, (RenderPass.__proto__ || Object.getPrototypeOf(RenderPass)).call(this));

			_this.scene = scene;
			_this.camera = camera;
			_this.overrideMaterial = overrideMaterial;
			_this.clearColor = clearColor;
			_this.clearAlpha = clearAlpha;
			_this.clear = true;
			_this.clearDepth = false;
			_this.needsSwap = false;

			return _this;
		}

		createClass(RenderPass, [{
			key: 'render',
			value: function render(renderer, writeBuffer, readBuffer) {

				var oldAutoClear = renderer.autoClear;
				renderer.autoClear = false;
				this.scene.overrideMaterial = this.overrideMaterial;
				this.writeBuffer = writeBuffer;
				var oldClearColor = void 0,
				    oldClearAlpha = void 0;
				if (this.clearColor) {

					oldClearColor = renderer.getClearColor().getHex();
					oldClearAlpha = renderer.getClearAlpha();
					renderer.setClearColor(this.clearColor, this.clearAlpha);
				}
				if (this.clearDepth) {

					renderer.clearDepth();
				}
				renderer.render(this.scene, this.camera, this.renderToScreen ? undefined : readBuffer, this.clear);
				if (this.clearColor) {

					renderer.setClearColor(oldClearColor, oldClearAlpha);
				}
				this.scene.overrideMaterial = undefined;
				renderer.autoClear = oldAutoClear;
			}
		}]);
		return RenderPass;
	}(Pass);

	var MaskPass = function (_Pass) {
			inherits(MaskPass, _Pass);

			function MaskPass(scene, camera) {
					classCallCheck(this, MaskPass);

					var _this = possibleConstructorReturn(this, (MaskPass.__proto__ || Object.getPrototypeOf(MaskPass)).call(this));

					_this.scene = scene;
					_this.camera = camera;

					_this.clear = true;
					_this.needsSwap = false;

					_this.inverse = false;

					return _this;
			}

			createClass(MaskPass, [{
					key: 'render',
					value: function render(renderer, writeBuffer, readBuffer) {

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

							state.buffers.stencil.setFunc(context.EQUAL, 1, 0xffffffff); // draw if == 1
							state.buffers.stencil.setOp(context.KEEP, context.KEEP, context.KEEP);
					}
			}]);
			return MaskPass;
	}(Pass);

	var ClearMaskPass = function (_Pass) {
		inherits(ClearMaskPass, _Pass);

		function ClearMaskPass() {
			classCallCheck(this, ClearMaskPass);

			var _this = possibleConstructorReturn(this, (ClearMaskPass.__proto__ || Object.getPrototypeOf(ClearMaskPass)).call(this));

			_this.needsSwap = false;

			return _this;
		}

		createClass(ClearMaskPass, [{
			key: 'render',
			value: function render(renderer) {

				renderer.state.buffers.stencil.setTest(false);
			}
		}]);
		return ClearMaskPass;
	}(Pass);

	var EffectComposer = function () {
		function EffectComposer(world) {
			var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
			var renderTarget = arguments[2];
			classCallCheck(this, EffectComposer);


			options = lodash.defaults(options, {
				renderer: undefined,
				camera: undefined,
				scene: undefined,
				overrideMaterial: undefined,
				clearColor: undefined,
				clearAlpha: 0
			});
			this.renderer = options.renderer || world.app.renderer;
			if (renderTarget === undefined) {

				var parameters = {
					minFilter: three.LinearFilter,
					magFilter: three.LinearFilter,
					format: three.RGBAFormat,
					stencilBuffer: false
				};
				var size = this.renderer.getDrawingBufferSize();
				renderTarget = new three.WebGLRenderTarget(size.width, size.height, parameters);
				renderTarget.texture.name = 'EffectComposer.rt1';
			}

			this.renderTarget1 = renderTarget;
			this.renderTarget2 = renderTarget.clone();
			this.renderTarget2.texture.name = 'EffectComposer.rt2';
			this.writeBuffer = this.renderTarget1;
			this.readBuffer = this.renderTarget2;

			this.passes = [];
			this.copyPass = new ShaderPass(CopyShader);

			this.addPass(new RenderPass(options.scene || world.scene, options.scene || world.camera));
		}

		createClass(EffectComposer, [{
			key: 'swapBuffers',
			value: function swapBuffers() {

				var tmp = this.readBuffer;
				this.readBuffer = this.writeBuffer;
				this.writeBuffer = tmp;
			}
		}, {
			key: 'addPass',
			value: function addPass(pass) {

				this.passes.push(pass);
				var size = this.renderer.getDrawingBufferSize();
				pass.setSize(size.width, size.height);
			}
		}, {
			key: 'insertPass',
			value: function insertPass(pass, index) {

				this.passes.splice(index, 0, pass);
			}
		}, {
			key: 'render',
			value: function render(delta) {

				var maskActive = false;
				var pass = void 0,
				    i = void 0,
				    il = this.passes.length;
				for (i = 0; i < il; i++) {

					pass = this.passes[i];
					if (pass.enabled === false) continue;
					pass.render(this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive);

					if (pass.needsSwap) {

						if (maskActive) {

							var context = this.renderer.context;
							context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);
							this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, delta);
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
		}, {
			key: 'reset',
			value: function reset(renderTarget) {

				if (renderTarget === undefined) {

					var size = this.renderer.getDrawingBufferSize();
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
		}, {
			key: 'setSize',
			value: function setSize(width, height) {

				this.renderTarget1.setSize(width, height);
				this.renderTarget2.setSize(width, height);
				for (var i = 0; i < this.passes.length; i++) {

					this.passes[i].setSize(width, height);
				}
			}
		}]);
		return EffectComposer;
	}();

	var AfterimageShader = {
	  uniforms: {
	    "damp": { value: 0.96 },
	    "tOld": { value: null },
	    "tNew": { value: null }
	  },

	  vertexShader: "\n    varying vec2 vUv;\n    void main() {\n      vUv = uv;\n      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n    }",

	  fragmentShader: "\n    uniform sampler2D tOld;\n    uniform sampler2D tNew;\n    uniform float damp;\n\n    varying vec2 vUv;\n\n    vec4 when_gt( vec4 texel, float y ) {\n      return max( sign( texel - y ), 0. );\n    }\n\n    void main() {\n      vec4 texelOld = texture2D( tOld, vUv );\n      vec4 texelNew = texture2D( tNew, vUv );\n\n      texelOld *= damp * when_gt( texelOld, 0.1 );\n\n      gl_FragColor = max( texelNew, texelOld );\n    }"
	};

	var AfterimagePass = function (_Pass) {
			inherits(AfterimagePass, _Pass);

			function AfterimagePass() {
					var damp = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0.96;
					var effectComposer = arguments[1];
					var renderToScreen = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
					classCallCheck(this, AfterimagePass);

					var _this = possibleConstructorReturn(this, (AfterimagePass.__proto__ || Object.getPrototypeOf(AfterimagePass)).call(this, effectComposer, renderToScreen));

					_this.uniforms = three.UniformsUtils.clone(AfterimageShader.uniforms);
					_this.uniforms["damp"].value = damp;

					_this.textureComp = new three.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
							minFilter: three.LinearFilter,
							magFilter: three.NearestFilter,
							format: three.RGBAFormat
					});

					_this.textureOld = new three.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
							minFilter: three.LinearFilter,
							magFilter: three.NearestFilter,
							format: three.RGBAFormat
					});

					_this.shaderMaterial = new three.ShaderMaterial({
							uniforms: _this.uniforms,
							vertexShader: AfterimageShader.vertexShader,
							fragmentShader: AfterimageShader.fragmentShader
					});

					_this.sceneComp = new three.Scene();
					_this.sceneScreen = new three.Scene();

					_this.camera = new three.OrthographicCamera(-1, 1, 1, -1, 0, 1);
					_this.camera.position.z = 1;
					var geometry = new three.PlaneBufferGeometry(2, 2);

					_this.quadComp = new three.Mesh(geometry, _this.shaderMaterial);
					_this.sceneComp.add(_this.quadComp);

					var material = new three.MeshBasicMaterial({ map: _this.textureComp.texture });
					var quadScreen = new three.Mesh(geometry, material);
					_this.sceneScreen.add(quadScreen);

					return _this;
			}

			createClass(AfterimagePass, [{
					key: 'render',
					value: function render(renderer, writeBuffer, readBuffer) {

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
			}]);
			return AfterimagePass;
	}(Pass);

	var DotScreenShader = {
		uniforms: {
			"tDiffuse": { value: null },
			"tSize": { value: new three.Vector2(256, 256) },
			"center": { value: new three.Vector2(0.5, 0.5) },
			"angle": { value: 1.57 },
			"scale": { value: 1.0 }
		},

		vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),

		fragmentShader: ["uniform vec2 center;", "uniform float angle;", "uniform float scale;", "uniform vec2 tSize;", "uniform sampler2D tDiffuse;", "varying vec2 vUv;", "float pattern() {", "float s = sin( angle ), c = cos( angle );", "vec2 tex = vUv * tSize - center;", "vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;", "return ( sin( point.x ) * sin( point.y ) ) * 4.0;", "}", "void main() {", "vec4 color = texture2D( tDiffuse, vUv );", "float average = ( color.r + color.g + color.b ) / 3.0;", "gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );", "}"].join("\n")
	};

	var DotScreenPass = function (_Pass) {
			inherits(DotScreenPass, _Pass);

			function DotScreenPass(center, angle, scale, effectComposer) {
					var renderToScreen = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
					classCallCheck(this, DotScreenPass);

					var _this = possibleConstructorReturn(this, (DotScreenPass.__proto__ || Object.getPrototypeOf(DotScreenPass)).call(this, effectComposer, renderToScreen));

					_this.uniforms = three.UniformsUtils.clone(DotScreenShader.uniforms);
					if (center !== undefined) _this.uniforms["center"].value.copy(center);
					if (angle !== undefined) _this.uniforms["angle"].value = angle;
					if (scale !== undefined) _this.uniforms["scale"].value = scale;

					_this.material = new three.ShaderMaterial({
							uniforms: _this.uniforms,
							vertexShader: DotScreenShader.vertexShader,
							fragmentShader: DotScreenShader.fragmentShader
					});

					_this.camera = new three.OrthographicCamera(-1, 1, 1, -1, 0, 1);
					_this.scene = new three.Scene();
					_this.quad = new three.Mesh(new three.PlaneBufferGeometry(2, 2), undefined);
					_this.quad.frustumCulled = false; // Avoid getting clipped
					_this.scene.add(_this.quad);

					return _this;
			}

			createClass(DotScreenPass, [{
					key: 'render',
					value: function render(renderer, writeBuffer, readBuffer) {

							this.uniforms["tDiffuse"].value = readBuffer.texture;
							this.uniforms["tSize"].value.set(readBuffer.width, readBuffer.height);

							this.quad.material = this.material;

							if (this.renderToScreen) {

									renderer.render(this.scene, this.camera);
							} else {

									renderer.render(this.scene, this.camera, writeBuffer, this.clear);
							}
					}
			}]);
			return DotScreenPass;
	}(Pass);

	var GlitchShader = {
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

		vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),

		fragmentShader: ["uniform int byp;", //should we apply the glitch ?
		"uniform sampler2D tDiffuse;", "uniform sampler2D tDisp;", "uniform float amount;", "uniform float angle;", "uniform float seed;", "uniform float seed_x;", "uniform float seed_y;", "uniform float distortion_x;", "uniform float distortion_y;", "uniform float col_s;", "varying vec2 vUv;", "float rand(vec2 co){", "return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);", "}", "void main() {", "if(byp<1) {", "vec2 p = vUv;", "float xs = floor(gl_FragCoord.x / 0.5);", "float ys = floor(gl_FragCoord.y / 0.5);",
		//based on staffantans glitch shader for unity https://github.com/staffantan/unityglitch
		"vec4 normal = texture2D (tDisp, p*seed*seed);", "if(p.y<distortion_x+col_s && p.y>distortion_x-col_s*seed) {", "if(seed_x>0.){", "p.y = 1. - (p.y + distortion_y);", "}", "else {", "p.y = distortion_y;", "}", "}", "if(p.x<distortion_y+col_s && p.x>distortion_y-col_s*seed) {", "if(seed_y>0.){", "p.x=distortion_x;", "}", "else {", "p.x = 1. - (p.x + distortion_x);", "}", "}", "p.x+=normal.x*seed_x*(seed/5.);", "p.y+=normal.y*seed_y*(seed/5.);",
		//base from RGB shift shader
		"vec2 offset = amount * vec2( cos(angle), sin(angle));", "vec4 cr = texture2D(tDiffuse, p + offset);", "vec4 cga = texture2D(tDiffuse, p);", "vec4 cb = texture2D(tDiffuse, p - offset);", "gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);",
		//add noise
		"vec4 snow = 200.*amount*vec4(rand(vec2(xs * seed,ys * seed*50.))*0.2);", "gl_FragColor = gl_FragColor+ snow;", "}", "else {", "gl_FragColor=texture2D (tDiffuse, vUv);", "}", "}"].join("\n")
	};

	var GlitchPass = function (_Pass) {
			inherits(GlitchPass, _Pass);

			function GlitchPass() {
					var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 64;
					var goWild = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
					var effectComposer = arguments[2];
					var renderToScreen = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
					classCallCheck(this, GlitchPass);

					var _this = possibleConstructorReturn(this, (GlitchPass.__proto__ || Object.getPrototypeOf(GlitchPass)).call(this, effectComposer, renderToScreen));

					_this.uniforms = three.UniformsUtils.clone(GlitchShader.uniforms);
					_this.uniforms["tDisp"].value = _this.generateHeightmap(size);

					_this.material = new three.ShaderMaterial({
							uniforms: _this.uniforms,
							vertexShader: GlitchShader.vertexShader,
							fragmentShader: GlitchShader.fragmentShader
					});

					_this.camera = new three.OrthographicCamera(-1, 1, 1, -1, 0, 1);
					_this.scene = new three.Scene();

					_this.quad = new three.Mesh(new three.PlaneBufferGeometry(2, 2), null);
					_this.quad.frustumCulled = false;
					_this.scene.add(_this.quad);

					_this.goWild = goWild;
					_this.curF = 0;
					_this.generateTrigger();

					return _this;
			}

			createClass(GlitchPass, [{
					key: 'render',
					value: function render(renderer, writeBuffer, readBuffer) {

							this.uniforms["tDiffuse"].value = readBuffer.texture;
							this.uniforms['seed'].value = Math.random();
							this.uniforms['byp'].value = 0;

							if (this.curF % this.randX === 0 || this.goWild === true) {

									this.uniforms['amount'].value = Math.random() / 30;
									this.uniforms['angle'].value = three.Math.randFloat(-Math.PI, Math.PI);
									this.uniforms['seed_x'].value = three.Math.randFloat(-1, 1);
									this.uniforms['seed_y'].value = three.Math.randFloat(-1, 1);
									this.uniforms['distortion_x'].value = three.Math.randFloat(0, 1);
									this.uniforms['distortion_y'].value = three.Math.randFloat(0, 1);
									this.curF = 0;
									this.generateTrigger();
							} else if (this.curF % this.randX < this.randX / 5) {

									this.uniforms['amount'].value = Math.random() / 90;
									this.uniforms['angle'].value = three.Math.randFloat(-Math.PI, Math.PI);
									this.uniforms['distortion_x'].value = three.Math.randFloat(0, 1);
									this.uniforms['distortion_y'].value = three.Math.randFloat(0, 1);
									this.uniforms['seed_x'].value = three.Math.randFloat(-0.3, 0.3);
									this.uniforms['seed_y'].value = three.Math.randFloat(-0.3, 0.3);
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
			}, {
					key: 'generateTrigger',
					value: function generateTrigger() {

							this.randX = three.Math.randInt(120, 240);
					}
			}, {
					key: 'generateHeightmap',
					value: function generateHeightmap(size) {

							var dataArr = new Float32Array(size * size * 3);
							var length = size * size;

							for (var i = 0; i < length; i++) {

									var val = three.Math.randFloat(0, 1);
									dataArr[i * 3 + 0] = val;
									dataArr[i * 3 + 1] = val;
									dataArr[i * 3 + 2] = val;
							}

							var texture = new three.DataTexture(dataArr, size, size, three.RGBFormat, three.FloatType);
							texture.needsUpdate = true;
							return texture;
					}
			}]);
			return GlitchPass;
	}(Pass);

	var OutlinePass = function (_Pass) {
		inherits(OutlinePass, _Pass);

		function OutlinePass(resolution, world) {
			var selectedObjects = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
			var effectComposer = arguments[3];
			classCallCheck(this, OutlinePass);

			var _this = possibleConstructorReturn(this, (OutlinePass.__proto__ || Object.getPrototypeOf(OutlinePass)).call(this, undefined, false));

			_this.BlurDirectionX = new three.Vector2(1.0, 0.0);
			_this.BlurDirectionY = new three.Vector2(0.0, 1.0);
			_this.renderScene = world.scene;
			_this.renderCamera = world.camera;
			_this.selectedObjects = selectedObjects;
			_this.visibleEdgeColor = new three.Color(1, 1, 1);
			_this.hiddenEdgeColor = new three.Color(0.1, 0.04, 0.02);
			_this.edgeGlow = 0.0;
			_this.usePatternTexture = false;
			_this.edgeThickness = 1.0;
			_this.edgeStrength = 3.0;
			_this.downSampleRatio = 2;
			_this.pulsePeriod = 0;

			_this.resolution = resolution !== undefined ? new three.Vector2(resolution.x, resolution.y) : new three.Vector2(256, 256);

			var pars = {
				minFilter: three.LinearFilter,
				magFilter: three.LinearFilter,
				format: three.RGBAFormat
			};

			var resx = Math.round(_this.resolution.x / _this.downSampleRatio);
			var resy = Math.round(_this.resolution.y / _this.downSampleRatio);

			_this.maskBufferMaterial = new three.MeshBasicMaterial({ color: 0xffffff });
			_this.maskBufferMaterial.side = three.DoubleSide;
			_this.renderTargetMaskBuffer = new three.WebGLRenderTarget(_this.resolution.x, _this.resolution.y, pars);
			_this.renderTargetMaskBuffer.texture.name = "OutlinePass.mask";
			_this.renderTargetMaskBuffer.texture.generateMipmaps = false;

			_this.depthMaterial = new three.MeshDepthMaterial();
			_this.depthMaterial.side = three.DoubleSide;
			_this.depthMaterial.depthPacking = three.RGBADepthPacking;
			_this.depthMaterial.blending = three.NoBlending;

			_this.prepareMaskMaterial = _this.getPrepareMaskMaterial();
			_this.prepareMaskMaterial.side = three.DoubleSide;
			_this.prepareMaskMaterial.fragmentShader = replaceDepthToViewZ(_this.prepareMaskMaterial.fragmentShader, _this.renderCamera);

			_this.renderTargetDepthBuffer = new three.WebGLRenderTarget(_this.resolution.x, _this.resolution.y, pars);
			_this.renderTargetDepthBuffer.texture.name = "OutlinePass.depth";
			_this.renderTargetDepthBuffer.texture.generateMipmaps = false;

			_this.renderTargetMaskDownSampleBuffer = new three.WebGLRenderTarget(resx, resy, pars);
			_this.renderTargetMaskDownSampleBuffer.texture.name = "OutlinePass.depthDownSample";
			_this.renderTargetMaskDownSampleBuffer.texture.generateMipmaps = false;

			_this.renderTargetBlurBuffer1 = new three.WebGLRenderTarget(resx, resy, pars);
			_this.renderTargetBlurBuffer1.texture.name = "OutlinePass.blur1";
			_this.renderTargetBlurBuffer1.texture.generateMipmaps = false;
			_this.renderTargetBlurBuffer2 = new three.WebGLRenderTarget(Math.round(resx / 2), Math.round(resy / 2), pars);
			_this.renderTargetBlurBuffer2.texture.name = "OutlinePass.blur2";
			_this.renderTargetBlurBuffer2.texture.generateMipmaps = false;

			_this.edgeDetectionMaterial = _this.getEdgeDetectionMaterial();
			_this.renderTargetEdgeBuffer1 = new three.WebGLRenderTarget(resx, resy, pars);
			_this.renderTargetEdgeBuffer1.texture.name = "OutlinePass.edge1";
			_this.renderTargetEdgeBuffer1.texture.generateMipmaps = false;
			_this.renderTargetEdgeBuffer2 = new three.WebGLRenderTarget(Math.round(resx / 2), Math.round(resy / 2), pars);
			_this.renderTargetEdgeBuffer2.texture.name = "OutlinePass.edge2";
			_this.renderTargetEdgeBuffer2.texture.generateMipmaps = false;

			var MAX_EDGE_THICKNESS = 4;
			var MAX_EDGE_GLOW = 4;

			_this.separableBlurMaterial1 = _this.getSeperableBlurMaterial(MAX_EDGE_THICKNESS);
			_this.separableBlurMaterial1.uniforms["texSize"].value = new three.Vector2(resx, resy);
			_this.separableBlurMaterial1.uniforms["kernelRadius"].value = 1;
			_this.separableBlurMaterial2 = _this.getSeperableBlurMaterial(MAX_EDGE_GLOW);
			_this.separableBlurMaterial2.uniforms["texSize"].value = new three.Vector2(Math.round(resx / 2), Math.round(resy / 2));
			_this.separableBlurMaterial2.uniforms["kernelRadius"].value = MAX_EDGE_GLOW;

			// Overlay material
			_this.overlayMaterial = _this.getOverlayMaterial();

			_this.copyUniforms = three.UniformsUtils.clone(CopyShader.uniforms);
			_this.copyUniforms["opacity"].value = 1.0;

			_this.materialCopy = new three.ShaderMaterial({
				uniforms: _this.copyUniforms,
				vertexShader: CopyShader.vertexShader,
				fragmentShader: CopyShader.fragmentShader,
				blending: three.NoBlending,
				depthTest: false,
				depthWrite: false,
				transparent: true
			});

			_this.enabled = true;
			_this.needsSwap = false;

			_this.oldClearColor = new three.Color();
			_this.oldClearAlpha = 1;

			_this.camera = new three.OrthographicCamera(-1, 1, 1, -1, 0, 1);
			_this.scene = new three.Scene();

			_this.quad = new three.Mesh(new three.PlaneBufferGeometry(2, 2), null);
			_this.quad.frustumCulled = false; // Avoid getting clipped
			_this.scene.add(_this.quad);

			_this.tempPulseColor1 = new three.Color();
			_this.tempPulseColor2 = new three.Color();
			_this.textureMatrix = new three.Matrix4();

			function replaceDepthToViewZ(string, camera) {

				var type = camera.isPerspectiveCamera ? "perspective" : "orthographic";
				return string.replace(/DEPTH_TO_VIEW_Z/g, type + "DepthToViewZ");
			}

			if (effectComposer) {

				effectComposer.addPass(_this);
			}

			return _this;
		}

		createClass(OutlinePass, [{
			key: "dispose",
			value: function dispose() {

				this.renderTargetMaskBuffer.dispose();
				this.renderTargetDepthBuffer.dispose();
				this.renderTargetMaskDownSampleBuffer.dispose();
				this.renderTargetBlurBuffer1.dispose();
				this.renderTargetBlurBuffer2.dispose();
				this.renderTargetEdgeBuffer1.dispose();
				this.renderTargetEdgeBuffer2.dispose();
			}
		}, {
			key: "setSize",
			value: function setSize(width, height) {

				this.renderTargetMaskBuffer.setSize(width, height);

				var resx = Math.round(width / this.downSampleRatio);
				var resy = Math.round(height / this.downSampleRatio);
				this.renderTargetMaskDownSampleBuffer.setSize(resx, resy);
				this.renderTargetBlurBuffer1.setSize(resx, resy);
				this.renderTargetEdgeBuffer1.setSize(resx, resy);
				this.separableBlurMaterial1.uniforms["texSize"].value = new three.Vector2(resx, resy);

				resx = Math.round(resx / 2);
				resy = Math.round(resy / 2);

				this.renderTargetBlurBuffer2.setSize(resx, resy);
				this.renderTargetEdgeBuffer2.setSize(resx, resy);

				this.separableBlurMaterial2.uniforms["texSize"].value = new three.Vector2(resx, resy);
			}
		}, {
			key: "changeVisibilityOfSelectedObjects",
			value: function changeVisibilityOfSelectedObjects(bVisible) {

				function gatherSelectedMeshesCallBack(object) {

					if (object instanceof three.Mesh) object.visible = bVisible;
				}

				for (var i = 0; i < this.selectedObjects.length; i++) {

					var selectedObject = this.selectedObjects[i];
					selectedObject.traverse(gatherSelectedMeshesCallBack);
				}
			}
		}, {
			key: "changeVisibilityOfNonSelectedObjects",
			value: function changeVisibilityOfNonSelectedObjects(bVisible) {

				var selectedMeshes = [];

				function gatherSelectedMeshesCallBack(object) {

					if (object instanceof three.Mesh) selectedMeshes.push(object);
				}

				for (var i = 0; i < this.selectedObjects.length; i++) {

					var selectedObject = this.selectedObjects[i];
					selectedObject.traverse(gatherSelectedMeshesCallBack);
				}

				function VisibilityChangeCallBack(object) {

					if (object instanceof three.Mesh || object instanceof three.Line || object instanceof three.Sprite) {

						var bFound = false;

						for (var _i = 0; _i < selectedMeshes.length; _i++) {

							var selectedObjectId = selectedMeshes[_i].id;
							if (selectedObjectId === object.id) {

								bFound = true;
								break;
							}
						}

						if (!bFound) {

							var visibility = object.visible;
							if (!bVisible || object.bVisible) object.visible = bVisible;
							object.bVisible = visibility;
						}
					}
				}

				this.renderScene.traverse(VisibilityChangeCallBack);
			}
		}, {
			key: "updateTextureMatrix",
			value: function updateTextureMatrix() {

				this.textureMatrix.set(0.5, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0, 1.0);
				this.textureMatrix.multiply(this.renderCamera.projectionMatrix);
				this.textureMatrix.multiply(this.renderCamera.matrixWorldInverse);
			}
		}, {
			key: "render",
			value: function render(renderer, writeBuffer, readBuffer, delta, maskActive) {

				if (this.selectedObjects.length === 0) return;

				this.oldClearColor.copy(renderer.getClearColor());
				this.oldClearAlpha = renderer.getClearAlpha();
				var oldAutoClear = renderer.autoClear;

				renderer.autoClear = false;

				if (maskActive) renderer.context.disable(renderer.context.STENCIL_TEST);

				renderer.setClearColor(0xffffff, 1);

				// Make selected objects invisible
				this.changeVisibilityOfSelectedObjects(false);

				var currentBackground = this.renderScene.background;
				this.renderScene.background = null;

				// 1. Draw Non Selected objects in the depth buffer
				this.renderScene.overrideMaterial = this.depthMaterial;
				renderer.render(this.renderScene, this.renderCamera, this.renderTargetDepthBuffer, true);

				// Make selected objects visible
				this.changeVisibilityOfSelectedObjects(true);

				// Update Texture Matrix for Depth compare
				this.updateTextureMatrix();

				// Make non selected objects invisible, and draw only the selected objects, by comparing the depth buffer of non selected objects
				this.changeVisibilityOfNonSelectedObjects(false);
				this.renderScene.overrideMaterial = this.prepareMaskMaterial;
				this.prepareMaskMaterial.uniforms["cameraNearFar"].value = new three.Vector2(this.renderCamera.near, this.renderCamera.far);
				this.prepareMaskMaterial.uniforms["depthTexture"].value = this.renderTargetDepthBuffer.texture;
				this.prepareMaskMaterial.uniforms["textureMatrix"].value = this.textureMatrix;
				renderer.render(this.renderScene, this.renderCamera, this.renderTargetMaskBuffer, true);
				this.renderScene.overrideMaterial = null;
				this.changeVisibilityOfNonSelectedObjects(true);

				this.renderScene.background = currentBackground;

				// 2. Downsample to Half resolution
				this.quad.material = this.materialCopy;
				this.copyUniforms["tDiffuse"].value = this.renderTargetMaskBuffer.texture;
				renderer.render(this.scene, this.camera, this.renderTargetMaskDownSampleBuffer, true);

				this.tempPulseColor1.copy(this.visibleEdgeColor);
				this.tempPulseColor2.copy(this.hiddenEdgeColor);

				if (this.pulsePeriod > 0) {

					var scalar = (1 + 0.25) / 2 + Math.cos(performance.now() * 0.01 / this.pulsePeriod) * (1.0 - 0.25) / 2;
					this.tempPulseColor1.multiplyScalar(scalar);
					this.tempPulseColor2.multiplyScalar(scalar);
				}

				// 3. Apply Edge Detection Pass
				this.quad.material = this.edgeDetectionMaterial;
				this.edgeDetectionMaterial.uniforms["maskTexture"].value = this.renderTargetMaskDownSampleBuffer.texture;
				this.edgeDetectionMaterial.uniforms["texSize"].value = new three.Vector2(this.renderTargetMaskDownSampleBuffer.width, this.renderTargetMaskDownSampleBuffer.height);
				this.edgeDetectionMaterial.uniforms["visibleEdgeColor"].value = this.tempPulseColor1;
				this.edgeDetectionMaterial.uniforms["hiddenEdgeColor"].value = this.tempPulseColor2;
				renderer.render(this.scene, this.camera, this.renderTargetEdgeBuffer1, true);

				// 4. Apply Blur on Half res
				this.quad.material = this.separableBlurMaterial1;
				this.separableBlurMaterial1.uniforms["colorTexture"].value = this.renderTargetEdgeBuffer1.texture;
				this.separableBlurMaterial1.uniforms["direction"].value = this.BlurDirectionX;
				this.separableBlurMaterial1.uniforms["kernelRadius"].value = this.edgeThickness;
				renderer.render(this.scene, this.camera, this.renderTargetBlurBuffer1, true);
				this.separableBlurMaterial1.uniforms["colorTexture"].value = this.renderTargetBlurBuffer1.texture;
				this.separableBlurMaterial1.uniforms["direction"].value = this.BlurDirectionY;
				renderer.render(this.scene, this.camera, this.renderTargetEdgeBuffer1, true);

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
				this.overlayMaterial.uniforms["maskTexture"].value = this.renderTargetMaskBuffer.texture;
				this.overlayMaterial.uniforms["edgeTexture1"].value = this.renderTargetEdgeBuffer1.texture;
				this.overlayMaterial.uniforms["edgeTexture2"].value = this.renderTargetEdgeBuffer2.texture;
				this.overlayMaterial.uniforms["patternTexture"].value = this.patternTexture;
				this.overlayMaterial.uniforms["edgeStrength"].value = this.edgeStrength;
				this.overlayMaterial.uniforms["edgeGlow"].value = this.edgeGlow;
				this.overlayMaterial.uniforms["usePatternTexture"].value = this.usePatternTexture;

				if (maskActive) renderer.context.enable(renderer.context.STENCIL_TEST);

				renderer.render(this.scene, this.camera, readBuffer, false);

				renderer.setClearColor(this.oldClearColor, this.oldClearAlpha);
				renderer.autoClear = oldAutoClear;
			}
		}, {
			key: "getPrepareMaskMaterial",
			value: function getPrepareMaskMaterial() {

				return new three.ShaderMaterial({
					uniforms: {
						"depthTexture": { value: null },
						"cameraNearFar": { value: new three.Vector2(0.5, 0.5) },
						"textureMatrix": { value: new three.Matrix4() }
					},

					vertexShader: ['varying vec4 projTexCoord;', 'varying vec4 vPosition;', 'uniform mat4 textureMatrix;', 'void main() {', '	vPosition = modelViewMatrix * vec4( position, 1.0 );', '	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );', '	projTexCoord = textureMatrix * worldPosition;', '	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );', '}'].join('\n'),

					fragmentShader: ['#include <packing>', 'varying vec4 vPosition;', 'varying vec4 projTexCoord;', 'uniform sampler2D depthTexture;', 'uniform vec2 cameraNearFar;', 'void main() {', '	float depth = unpackRGBAToDepth(texture2DProj( depthTexture, projTexCoord ));', '	float viewZ = - DEPTH_TO_VIEW_Z( depth, cameraNearFar.x, cameraNearFar.y );', '	float depthTest = (-vPosition.z > viewZ) ? 1.0 : 0.0;', '	gl_FragColor = vec4(0.0, depthTest, 1.0, 1.0);', '}'].join('\n')
				});
			}
		}, {
			key: "getEdgeDetectionMaterial",
			value: function getEdgeDetectionMaterial() {

				return new three.ShaderMaterial({
					uniforms: {
						"maskTexture": { value: null },
						"texSize": { value: new three.Vector2(0.5, 0.5) },
						"visibleEdgeColor": { value: new three.Vector3(1.0, 1.0, 1.0) },
						"hiddenEdgeColor": { value: new three.Vector3(1.0, 1.0, 1.0) }
					},

					vertexShader: "varying vec2 vUv;\n\t\t\t\tvoid main() {\n\t\t\t\t\tvUv = uv;\n\t\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\t\t\t\t}",

					fragmentShader: "varying vec2 vUv;\n\t\t\t\tuniform sampler2D maskTexture;\n\t\t\t\tuniform vec2 texSize;\n\t\t\t\tuniform vec3 visibleEdgeColor;\n\t\t\t\tuniform vec3 hiddenEdgeColor;\n\n\t\t\t\tvoid main() {\n\t\t\t\t\tvec2 invSize = 1.0 / texSize;\n\t\t\t\t\tvec4 uvOffset = vec4(1.0, 0.0, 0.0, 1.0) * vec4(invSize, invSize);\n\t\t\t\t\tvec4 c1 = texture2D( maskTexture, vUv + uvOffset.xy);\n\t\t\t\t\tvec4 c2 = texture2D( maskTexture, vUv - uvOffset.xy);\n\t\t\t\t\tvec4 c3 = texture2D( maskTexture, vUv + uvOffset.yw);\n\t\t\t\t\tvec4 c4 = texture2D( maskTexture, vUv - uvOffset.yw);\n\t\t\t\t\tfloat diff1 = (c1.r - c2.r)*0.5;\n\t\t\t\t\tfloat diff2 = (c3.r - c4.r)*0.5;\n\t\t\t\t\tfloat d = length( vec2(diff1, diff2) );\n\t\t\t\t\tfloat a1 = min(c1.g, c2.g);\n\t\t\t\t\tfloat a2 = min(c3.g, c4.g);\n\t\t\t\t\tfloat visibilityFactor = min(a1, a2);\n\t\t\t\t\tvec3 edgeColor = 1.0 - visibilityFactor > 0.001 ? visibleEdgeColor : hiddenEdgeColor;\n\t\t\t\t\tgl_FragColor = vec4(edgeColor, 1.0) * vec4(d);\n\t\t\t\t}"
				});
			}
		}, {
			key: "getSeperableBlurMaterial",
			value: function getSeperableBlurMaterial(maxRadius) {

				return new three.ShaderMaterial({
					defines: {
						"MAX_RADIUS": maxRadius
					},

					uniforms: {
						"colorTexture": { value: null },
						"texSize": { value: new three.Vector2(0.5, 0.5) },
						"direction": { value: new three.Vector2(0.5, 0.5) },
						"kernelRadius": { value: 1.0 }
					},

					vertexShader: "varying vec2 vUv;\n\t\t\t\tvoid main() {\n\t\t\t\t\tvUv = uv;\n\t\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\t\t\t\t}",

					fragmentShader: "#include <common>\n\t\t\t\tvarying vec2 vUv;\n\t\t\t\tuniform sampler2D colorTexture;\n\t\t\t\tuniform vec2 texSize;\n\t\t\t\tuniform vec2 direction;\n\t\t\t\tuniform float kernelRadius;\n\n\t\t\t\tfloat gaussianPdf(in float x, in float sigma) {\n\t\t\t\t\treturn 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;\n\t\t\t\t}\n\t\t\t\tvoid main() {\n\t\t\t\t\tvec2 invSize = 1.0 / texSize;\n\t\t\t\t\tfloat weightSum = gaussianPdf(0.0, kernelRadius);\n\t\t\t\t\tvec3 diffuseSum = texture2D( colorTexture, vUv).rgb * weightSum;\n\t\t\t\t\tvec2 delta = direction * invSize * kernelRadius/float(MAX_RADIUS);\n\t\t\t\t\tvec2 uvOffset = delta;\n\t\t\t\t\tfor( int i = 1; i <= MAX_RADIUS; i ++ ) {\n\t\t\t\t\t\tfloat w = gaussianPdf(uvOffset.x, kernelRadius);\n\t\t\t\t\t\tvec3 sample1 = texture2D( colorTexture, vUv + uvOffset).rgb;\n\t\t\t\t\t\tvec3 sample2 = texture2D( colorTexture, vUv - uvOffset).rgb;\n\t\t\t\t\t\tdiffuseSum += ((sample1 + sample2) * w);\n\t\t\t\t\t\tweightSum += (2.0 * w);\n\t\t\t\t\t\tuvOffset += delta;\n\t\t\t\t\t}\n\t\t\t\t\tgl_FragColor = vec4(diffuseSum/weightSum, 1.0);\n\t\t\t\t}"
				});
			}
		}, {
			key: "getOverlayMaterial",
			value: function getOverlayMaterial() {

				return new three.ShaderMaterial({
					uniforms: {
						"maskTexture": { value: null },
						"edgeTexture1": { value: null },
						"edgeTexture2": { value: null },
						"patternTexture": { value: null },
						"edgeStrength": { value: 1.0 },
						"edgeGlow": { value: 1.0 },
						"usePatternTexture": { value: 0.0 }
					},

					vertexShader: "varying vec2 vUv;\n\t\t\t\tvoid main() {\n\t\t\t\t\tvUv = uv;\n\t\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\t\t\t\t}",

					fragmentShader: "varying vec2 vUv;\n\t\t\t\tuniform sampler2D maskTexture;\n\t\t\t\tuniform sampler2D edgeTexture1;\n\t\t\t\tuniform sampler2D edgeTexture2;\n\t\t\t\tuniform sampler2D patternTexture;\n\t\t\t\tuniform float edgeStrength;\n\t\t\t\tuniform float edgeGlow;\n\t\t\t\tuniform bool usePatternTexture;\n\n\t\t\t\tvoid main() {\n\t\t\t\t\tvec4 edgeValue1 = texture2D(edgeTexture1, vUv);\n\t\t\t\t\tvec4 edgeValue2 = texture2D(edgeTexture2, vUv);\n\t\t\t\t\tvec4 maskColor = texture2D(maskTexture, vUv);\n\t\t\t\t\tvec4 patternColor = texture2D(patternTexture, 6.0 * vUv);\n\t\t\t\t\tfloat visibilityFactor = 1.0 - maskColor.g > 0.0 ? 1.0 : 0.5;\n\t\t\t\t\tvec4 edgeValue = edgeValue1 + edgeValue2 * edgeGlow;\n\t\t\t\t\tvec4 finalColor = edgeStrength * maskColor.r * edgeValue;\n\t\t\t\t\tif(usePatternTexture)\n\t\t\t\t\t\tfinalColor += + visibilityFactor * (1.0 - maskColor.r) * (1.0 - patternColor.r);\n\t\t\t\t\tgl_FragColor = finalColor;\n\t\t\t\t}",
					blending: three.AdditiveBlending,
					depthTest: false,
					depthWrite: false,
					transparent: true
				});
			}
		}]);
		return OutlinePass;
	}(Pass);

	/**
	 * @author mattatz / http://mattatz.github.io
	 *
	 * Based on
	 * Charlotte Hoare MSc Project / http://nccastaff.bournemouth.ac.uk/jmacey/MastersProjects/MSc12/Hoare/index.html
	 * and
	 * Su et al. Real-Time rendering of watercolor effects for virtual environments. / http://dl.acm.org/citation.cfm?id=2131253
	 */

	var WatercolorShader = {

			uniforms: {
					"tDiffuse": { type: "t", value: null }, // diffuse texture
					"tPaper": { type: "t", value: null }, // paper texture
					"texel": { type: "v2", value: new three.Vector2(1.0 / 512, 1.0 / 512) },
					"scale": { type: "f", value: 0.03 }, // wobble scale
					"threshold": { type: "f", value: 0.7 }, // edge threshold
					"darkening": { type: "f", value: 1.75 }, // edge darkening
					"pigment": { type: "f", value: 1.2 } // pigment dispersion
			},

			vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),

			fragmentShader: ["uniform sampler2D tDiffuse;", "uniform sampler2D tPaper;", "uniform vec2 texel;", "uniform float scale;", "uniform float threshold;", "uniform float darkening;", "uniform float pigment;", "varying vec2 vUv;", "float sobel(sampler2D tex, vec2 uv) {", "vec3 hr = vec3(0., 0., 0.);", "hr += texture2D(tex, (uv + vec2(-1.0, -1.0) * texel)).rgb *  1.0;", "hr += texture2D(tex, (uv + vec2( 0.0, -1.0) * texel)).rgb *  0.0;", "hr += texture2D(tex, (uv + vec2( 1.0, -1.0) * texel)).rgb * -1.0;", "hr += texture2D(tex, (uv + vec2(-1.0,  0.0) * texel)).rgb *  2.0;", "hr += texture2D(tex, (uv + vec2( 0.0,  0.0) * texel)).rgb *  0.0;", "hr += texture2D(tex, (uv + vec2( 1.0,  0.0) * texel)).rgb * -2.0;", "hr += texture2D(tex, (uv + vec2(-1.0,  1.0) * texel)).rgb *  1.0;", "hr += texture2D(tex, (uv + vec2( 0.0,  1.0) * texel)).rgb *  0.0;", "hr += texture2D(tex, (uv + vec2( 1.0,  1.0) * texel)).rgb * -1.0;", "vec3 vt = vec3(0., 0., 0.);", "vt += texture2D(tex, (uv + vec2(-1.0, -1.0) * texel)).rgb *  1.0;", "vt += texture2D(tex, (uv + vec2( 0.0, -1.0) * texel)).rgb *  2.0;", "vt += texture2D(tex, (uv + vec2( 1.0, -1.0) * texel)).rgb *  1.0;", "vt += texture2D(tex, (uv + vec2(-1.0,  0.0) * texel)).rgb *  0.0;", "vt += texture2D(tex, (uv + vec2( 0.0,  0.0) * texel)).rgb *  0.0;", "vt += texture2D(tex, (uv + vec2( 1.0,  0.0) * texel)).rgb *  0.0;", "vt += texture2D(tex, (uv + vec2(-1.0,  1.0) * texel)).rgb * -1.0;", "vt += texture2D(tex, (uv + vec2( 0.0,  1.0) * texel)).rgb * -2.0;", "vt += texture2D(tex, (uv + vec2( 1.0,  1.0) * texel)).rgb * -1.0;", "return sqrt(dot(hr, hr) + dot(vt, vt));", "}", "vec2 wobble(sampler2D tex, vec2 uv) {", "return uv + (texture2D(tex, uv).xy - 0.5) * scale;", "}", "vec4 edgeDarkening(sampler2D tex, vec2 uv) {", "vec4 c = texture2D(tex, uv);", "return c * (1.0 - (1.0 - c) * (darkening - 1.0));", "}", "float granulation(sampler2D tex, vec2 uv, float beta) {", "vec4 c = texture2D(tex, uv);", "float intensity = (c.r + c.g + c.b) / 3.0;", "return 1.0 + beta * (intensity - 0.5);", "}", "void main() {", "vec2 uv = vUv;", "uv = wobble(tPaper, uv);", "float pd = granulation(tPaper, vUv, pigment);", // pigment dispersion

			"float edge = sobel(tDiffuse, uv);", "if (edge > threshold) {", "gl_FragColor = pd * edgeDarkening(tDiffuse, uv);", "} else {", "gl_FragColor = pd * texture2D(tDiffuse, uv);", "}", "}"].join("\n")

	};

	/**
	 * @author mattatz / http://mattatz.github.io
	 */

	var WatercolorPass = function (_Pass) {
			inherits(WatercolorPass, _Pass);

			function WatercolorPass(tPaper, effectComposer, renderToScreen) {
					classCallCheck(this, WatercolorPass);

					var _this = possibleConstructorReturn(this, (WatercolorPass.__proto__ || Object.getPrototypeOf(WatercolorPass)).call(this, effectComposer, renderToScreen));

					var shader = WatercolorShader;
					_this.uniforms = three.UniformsUtils.clone(shader.uniforms);

					tPaper.wrapS = tPaper.wrapT = three.RepeatWrapping;
					_this.uniforms["tPaper"].value = tPaper;

					_this.material = new three.ShaderMaterial({
							uniforms: _this.uniforms,
							vertexShader: shader.vertexShader,
							fragmentShader: shader.fragmentShader
					});

					_this.enabled = true;
					_this.renderToScreen = renderToScreen;
					_this.needsSwap = true;

					_this.camera = new three.OrthographicCamera(-1, 1, 1, -1, 0, 1);
					_this.scene = new three.Scene();

					_this.quad = new three.Mesh(new three.PlaneBufferGeometry(2, 2), undefined);
					_this.scene.add(_this.quad);

					return _this;
			}

			createClass(WatercolorPass, [{
					key: 'render',
					value: function render(renderer, writeBuffer, readBuffer) {

							this.uniforms["tDiffuse"].value = readBuffer;
							this.uniforms["texel"].value = new three.Vector2(1.0 / readBuffer.width, 1.0 / readBuffer.height);

							this.quad.material = this.material;
							if (this.renderToScreen) {

									renderer.render(this.scene, this.camera);
							} else {

									renderer.render(this.scene, this.camera, writeBuffer, false);
							}
					}
			}]);
			return WatercolorPass;
	}(Pass);

	var TestShader = {
	  uniforms: {
	    "tDiffuse": { value: null },
	    "tSize": { value: new three.Vector2(256, 256) },
	    "center": { value: new three.Vector2(0.5, 0.5) },
	    "angle": { value: 1.57 },
	    "scale": { value: 1.0 }
	  },

	  vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),

	  fragmentShader: ["uniform vec2 center;\n    uniform float angle;\n    uniform float scale;\n    uniform vec2 tSize;\n    uniform sampler2D tDiffuse;\n    varying vec2 vUv;\n    float pattern() {\n      float s = sin( angle ), c = cos( angle );\n      vec2 tex = vUv * tSize - center;\n      vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;\n      return ( sin( point.x ) * sin( point.y ) ) * 4.0;\n    }\n\nconst float PI = 3.1415926536;\nconst float PI2 = PI * 2.0; \nconst int mSize = 9;\nconst int kSize = (mSize-1)/2;\nconst float sigma = 3.0;\nfloat kernel[mSize];\n\nfloat normpdf(in float x, in float sigma) \n{\n\treturn 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;\n}\n\nvec3 colorDodge(in vec3 src, in vec3 dst)\n{\n    return step(0.0, dst) * mix(min(vec3(1.0), dst/ (1.0 - src)), vec3(1.0), step(1.0, src)); \n}\n\nfloat greyScale(in vec3 col) \n{\n    return dot(col, vec3(0.3, 0.59, 0.11));\n    //return dot(col, vec3(0.2126, 0.7152, 0.0722)); //sRGB\n}\n\nvec2 random(vec2 p){\n\tp = fract(p * vec2(443.897, 441.423));\n    p += dot(p, p.yx+19.19);\n    return fract((p.xx+p.yx)*p.xy);\n}\n\n\n    void main() {\n    \tvec2 q = -1.0 + 2.0 *vUv;\n      vec4 color = texture2D( tDiffuse, vUv );\n      vec3 col = color.rgb;\n      \n      vec2 r = random(q);\n      r.x *= PI2;\n      vec2 cr = vec2(sin(r.x),cos(r.x))*sqrt(r.y);\n    \n      vec3 blurred = color.rgb;\n    \n    \n    vec3 inv = vec3(1.0) - blurred; \n    // color dodge\n    vec3 lighten = colorDodge(col, inv);\n    // grey scale\n    vec3 res = vec3(greyScale(lighten));\n    \n    // more contrast\n    res = vec3(pow(res.x, 3.0)); \n      \n      \n      gl_FragColor = vec4( res,1.0 );\n    }"].join("\n")
	};

	var TestPass = function (_Pass) {
			inherits(TestPass, _Pass);

			function TestPass(center, angle, scale, effectComposer) {
					var renderToScreen = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
					classCallCheck(this, TestPass);

					var _this = possibleConstructorReturn(this, (TestPass.__proto__ || Object.getPrototypeOf(TestPass)).call(this, effectComposer, renderToScreen));

					_this.uniforms = three.UniformsUtils.clone(TestShader.uniforms);
					if (center !== undefined) _this.uniforms["center"].value.copy(center);
					if (angle !== undefined) _this.uniforms["angle"].value = angle;
					if (scale !== undefined) _this.uniforms["scale"].value = scale;

					_this.material = new three.ShaderMaterial({
							uniforms: _this.uniforms,
							vertexShader: TestShader.vertexShader,
							fragmentShader: TestShader.fragmentShader
					});

					_this.camera = new three.OrthographicCamera(-1, 1, 1, -1, 0, 1);
					_this.scene = new three.Scene();
					_this.quad = new three.Mesh(new three.PlaneBufferGeometry(2, 2), null);
					_this.quad.frustumCulled = false; // Avoid getting clipped
					_this.scene.add(_this.quad);

					return _this;
			}

			createClass(TestPass, [{
					key: 'render',
					value: function render(renderer, writeBuffer, readBuffer) {

							this.uniforms["tDiffuse"].value = readBuffer.texture;
							this.uniforms["tSize"].value.set(readBuffer.width, readBuffer.height);

							this.quad.material = this.material;

							if (this.renderToScreen) {

									renderer.render(this.scene, this.camera);
							} else {

									renderer.render(this.scene, this.camera, writeBuffer, this.clear);
							}
					}
			}]);
			return TestPass;
	}(Pass);

	/**
	 * @author alteredq / http://alteredqualia.com/
	 * @author davidedc / http://www.sketchpatch.net/
	 *
	 * NVIDIA FXAA by Timothy Lottes
	 * http://timothylottes.blogspot.com/2011/06/fxaa3-source-released.html
	 * - WebGL port by @supereggbert
	 * http://www.glge.org/demos/fxaa/
	 */

	var FXAAShader = {

		uniforms: {

			"tDiffuse": { value: null },
			"resolution": { value: new three.Vector2(1 / 1024, 1 / 512) }

		},

		vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),

		fragmentShader: ["precision highp float;", "", "uniform sampler2D tDiffuse;", "", "uniform vec2 resolution;", "", "varying vec2 vUv;", "", "// FXAA 3.11 implementation by NVIDIA, ported to WebGL by Agost Biro (biro@archilogic.com)", "", "//----------------------------------------------------------------------------------", "// File:        es3-kepler\FXAA\assets\shaders/FXAA_DefaultES.frag", "// SDK Version: v3.00", "// Email:       gameworks@nvidia.com", "// Site:        http://developer.nvidia.com/", "//", "// Copyright (c) 2014-2015, NVIDIA CORPORATION. All rights reserved.", "//", "// Redistribution and use in source and binary forms, with or without", "// modification, are permitted provided that the following conditions", "// are met:", "//  * Redistributions of source code must retain the above copyright", "//    notice, this list of conditions and the following disclaimer.", "//  * Redistributions in binary form must reproduce the above copyright", "//    notice, this list of conditions and the following disclaimer in the", "//    documentation and/or other materials provided with the distribution.", "//  * Neither the name of NVIDIA CORPORATION nor the names of its", "//    contributors may be used to endorse or promote products derived", "//    from this software without specific prior written permission.", "//", "// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS ``AS IS'' AND ANY", "// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE", "// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR", "// PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR", "// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,", "// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,", "// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR", "// PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY", "// OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT", "// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE", "// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.", "//", "//----------------------------------------------------------------------------------", "", "#define FXAA_PC 1", "#define FXAA_GLSL_100 1", "#define FXAA_QUALITY_PRESET 12", "", "#define FXAA_GREEN_AS_LUMA 1", "", "/*--------------------------------------------------------------------------*/", "#ifndef FXAA_PC_CONSOLE", "    //", "    // The console algorithm for PC is included", "    // for developers targeting really low spec machines.", "    // Likely better to just run FXAA_PC, and use a really low preset.", "    //", "    #define FXAA_PC_CONSOLE 0", "#endif", "/*--------------------------------------------------------------------------*/", "#ifndef FXAA_GLSL_120", "    #define FXAA_GLSL_120 0", "#endif", "/*--------------------------------------------------------------------------*/", "#ifndef FXAA_GLSL_130", "    #define FXAA_GLSL_130 0", "#endif", "/*--------------------------------------------------------------------------*/", "#ifndef FXAA_HLSL_3", "    #define FXAA_HLSL_3 0", "#endif", "/*--------------------------------------------------------------------------*/", "#ifndef FXAA_HLSL_4", "    #define FXAA_HLSL_4 0", "#endif", "/*--------------------------------------------------------------------------*/", "#ifndef FXAA_HLSL_5", "    #define FXAA_HLSL_5 0", "#endif", "/*==========================================================================*/", "#ifndef FXAA_GREEN_AS_LUMA", "    //", "    // For those using non-linear color,", "    // and either not able to get luma in alpha, or not wanting to,", "    // this enables FXAA to run using green as a proxy for luma.", "    // So with this enabled, no need to pack luma in alpha.", "    //", "    // This will turn off AA on anything which lacks some amount of green.", "    // Pure red and blue or combination of only R and B, will get no AA.", "    //", "    // Might want to lower the settings for both,", "    //    fxaaConsoleEdgeThresholdMin", "    //    fxaaQualityEdgeThresholdMin", "    // In order to insure AA does not get turned off on colors", "    // which contain a minor amount of green.", "    //", "    // 1 = On.", "    // 0 = Off.", "    //", "    #define FXAA_GREEN_AS_LUMA 0", "#endif", "/*--------------------------------------------------------------------------*/", "#ifndef FXAA_EARLY_EXIT", "    //", "    // Controls algorithm's early exit path.", "    // On PS3 turning this ON adds 2 cycles to the shader.", "    // On 360 turning this OFF adds 10ths of a millisecond to the shader.", "    // Turning this off on console will result in a more blurry image.", "    // So this defaults to on.", "    //", "    // 1 = On.", "    // 0 = Off.", "    //", "    #define FXAA_EARLY_EXIT 1", "#endif", "/*--------------------------------------------------------------------------*/", "#ifndef FXAA_DISCARD", "    //", "    // Only valid for PC OpenGL currently.", "    // Probably will not work when FXAA_GREEN_AS_LUMA = 1.", "    //", "    // 1 = Use discard on pixels which don't need AA.", "    //     For APIs which enable concurrent TEX+ROP from same surface.", "    // 0 = Return unchanged color on pixels which don't need AA.", "    //", "    #define FXAA_DISCARD 0", "#endif", "/*--------------------------------------------------------------------------*/", "#ifndef FXAA_FAST_PIXEL_OFFSET", "    //", "    // Used for GLSL 120 only.", "    //", "    // 1 = GL API supports fast pixel offsets", "    // 0 = do not use fast pixel offsets", "    //", "    #ifdef GL_EXT_gpu_shader4", "        #define FXAA_FAST_PIXEL_OFFSET 1", "    #endif", "    #ifdef GL_NV_gpu_shader5", "        #define FXAA_FAST_PIXEL_OFFSET 1", "    #endif", "    #ifdef GL_ARB_gpu_shader5", "        #define FXAA_FAST_PIXEL_OFFSET 1", "    #endif", "    #ifndef FXAA_FAST_PIXEL_OFFSET", "        #define FXAA_FAST_PIXEL_OFFSET 0", "    #endif", "#endif", "/*--------------------------------------------------------------------------*/", "#ifndef FXAA_GATHER4_ALPHA", "    //", "    // 1 = API supports gather4 on alpha channel.", "    // 0 = API does not support gather4 on alpha channel.", "    //", "    #if (FXAA_HLSL_5 == 1)", "        #define FXAA_GATHER4_ALPHA 1", "    #endif", "    #ifdef GL_ARB_gpu_shader5", "        #define FXAA_GATHER4_ALPHA 1", "    #endif", "    #ifdef GL_NV_gpu_shader5", "        #define FXAA_GATHER4_ALPHA 1", "    #endif", "    #ifndef FXAA_GATHER4_ALPHA", "        #define FXAA_GATHER4_ALPHA 0", "    #endif", "#endif", "", "", "/*============================================================================", "                        FXAA QUALITY - TUNING KNOBS", "------------------------------------------------------------------------------", "NOTE the other tuning knobs are now in the shader function inputs!", "============================================================================*/", "#ifndef FXAA_QUALITY_PRESET", "    //", "    // Choose the quality preset.", "    // This needs to be compiled into the shader as it effects code.", "    // Best option to include multiple presets is to", "    // in each shader define the preset, then include this file.", "    //", "    // OPTIONS", "    // -----------------------------------------------------------------------", "    // 10 to 15 - default medium dither (10=fastest, 15=highest quality)", "    // 20 to 29 - less dither, more expensive (20=fastest, 29=highest quality)", "    // 39       - no dither, very expensive", "    //", "    // NOTES", "    // -----------------------------------------------------------------------", "    // 12 = slightly faster then FXAA 3.9 and higher edge quality (default)", "    // 13 = about same speed as FXAA 3.9 and better than 12", "    // 23 = closest to FXAA 3.9 visually and performance wise", "    //  _ = the lowest digit is directly related to performance", "    // _  = the highest digit is directly related to style", "    //", "    #define FXAA_QUALITY_PRESET 12", "#endif", "", "", "/*============================================================================", "", "                           FXAA QUALITY - PRESETS", "", "============================================================================*/", "", "/*============================================================================", "                     FXAA QUALITY - MEDIUM DITHER PRESETS", "============================================================================*/", "#if (FXAA_QUALITY_PRESET == 10)", "    #define FXAA_QUALITY_PS 3", "    #define FXAA_QUALITY_P0 1.5", "    #define FXAA_QUALITY_P1 3.0", "    #define FXAA_QUALITY_P2 12.0", "#endif", "/*--------------------------------------------------------------------------*/", "#if (FXAA_QUALITY_PRESET == 11)", "    #define FXAA_QUALITY_PS 4", "    #define FXAA_QUALITY_P0 1.0", "    #define FXAA_QUALITY_P1 1.5", "    #define FXAA_QUALITY_P2 3.0", "    #define FXAA_QUALITY_P3 12.0", "#endif", "/*--------------------------------------------------------------------------*/", "#if (FXAA_QUALITY_PRESET == 12)", "    #define FXAA_QUALITY_PS 5", "    #define FXAA_QUALITY_P0 1.0", "    #define FXAA_QUALITY_P1 1.5", "    #define FXAA_QUALITY_P2 2.0", "    #define FXAA_QUALITY_P3 4.0", "    #define FXAA_QUALITY_P4 12.0", "#endif", "/*--------------------------------------------------------------------------*/", "#if (FXAA_QUALITY_PRESET == 13)", "    #define FXAA_QUALITY_PS 6", "    #define FXAA_QUALITY_P0 1.0", "    #define FXAA_QUALITY_P1 1.5", "    #define FXAA_QUALITY_P2 2.0", "    #define FXAA_QUALITY_P3 2.0", "    #define FXAA_QUALITY_P4 4.0", "    #define FXAA_QUALITY_P5 12.0", "#endif", "/*--------------------------------------------------------------------------*/", "#if (FXAA_QUALITY_PRESET == 14)", "    #define FXAA_QUALITY_PS 7", "    #define FXAA_QUALITY_P0 1.0", "    #define FXAA_QUALITY_P1 1.5", "    #define FXAA_QUALITY_P2 2.0", "    #define FXAA_QUALITY_P3 2.0", "    #define FXAA_QUALITY_P4 2.0", "    #define FXAA_QUALITY_P5 4.0", "    #define FXAA_QUALITY_P6 12.0", "#endif", "/*--------------------------------------------------------------------------*/", "#if (FXAA_QUALITY_PRESET == 15)", "    #define FXAA_QUALITY_PS 8", "    #define FXAA_QUALITY_P0 1.0", "    #define FXAA_QUALITY_P1 1.5", "    #define FXAA_QUALITY_P2 2.0", "    #define FXAA_QUALITY_P3 2.0", "    #define FXAA_QUALITY_P4 2.0", "    #define FXAA_QUALITY_P5 2.0", "    #define FXAA_QUALITY_P6 4.0", "    #define FXAA_QUALITY_P7 12.0", "#endif", "", "/*============================================================================", "                     FXAA QUALITY - LOW DITHER PRESETS", "============================================================================*/", "#if (FXAA_QUALITY_PRESET == 20)", "    #define FXAA_QUALITY_PS 3", "    #define FXAA_QUALITY_P0 1.5", "    #define FXAA_QUALITY_P1 2.0", "    #define FXAA_QUALITY_P2 8.0", "#endif", "/*--------------------------------------------------------------------------*/", "#if (FXAA_QUALITY_PRESET == 21)", "    #define FXAA_QUALITY_PS 4", "    #define FXAA_QUALITY_P0 1.0", "    #define FXAA_QUALITY_P1 1.5", "    #define FXAA_QUALITY_P2 2.0", "    #define FXAA_QUALITY_P3 8.0", "#endif", "/*--------------------------------------------------------------------------*/", "#if (FXAA_QUALITY_PRESET == 22)", "    #define FXAA_QUALITY_PS 5", "    #define FXAA_QUALITY_P0 1.0", "    #define FXAA_QUALITY_P1 1.5", "    #define FXAA_QUALITY_P2 2.0", "    #define FXAA_QUALITY_P3 2.0", "    #define FXAA_QUALITY_P4 8.0", "#endif", "/*--------------------------------------------------------------------------*/", "#if (FXAA_QUALITY_PRESET == 23)", "    #define FXAA_QUALITY_PS 6", "    #define FXAA_QUALITY_P0 1.0", "    #define FXAA_QUALITY_P1 1.5", "    #define FXAA_QUALITY_P2 2.0", "    #define FXAA_QUALITY_P3 2.0", "    #define FXAA_QUALITY_P4 2.0", "    #define FXAA_QUALITY_P5 8.0", "#endif", "/*--------------------------------------------------------------------------*/", "#if (FXAA_QUALITY_PRESET == 24)", "    #define FXAA_QUALITY_PS 7", "    #define FXAA_QUALITY_P0 1.0", "    #define FXAA_QUALITY_P1 1.5", "    #define FXAA_QUALITY_P2 2.0", "    #define FXAA_QUALITY_P3 2.0", "    #define FXAA_QUALITY_P4 2.0", "    #define FXAA_QUALITY_P5 3.0", "    #define FXAA_QUALITY_P6 8.0", "#endif", "/*--------------------------------------------------------------------------*/", "#if (FXAA_QUALITY_PRESET == 25)", "    #define FXAA_QUALITY_PS 8", "    #define FXAA_QUALITY_P0 1.0", "    #define FXAA_QUALITY_P1 1.5", "    #define FXAA_QUALITY_P2 2.0", "    #define FXAA_QUALITY_P3 2.0", "    #define FXAA_QUALITY_P4 2.0", "    #define FXAA_QUALITY_P5 2.0", "    #define FXAA_QUALITY_P6 4.0", "    #define FXAA_QUALITY_P7 8.0", "#endif", "/*--------------------------------------------------------------------------*/", "#if (FXAA_QUALITY_PRESET == 26)", "    #define FXAA_QUALITY_PS 9", "    #define FXAA_QUALITY_P0 1.0", "    #define FXAA_QUALITY_P1 1.5", "    #define FXAA_QUALITY_P2 2.0", "    #define FXAA_QUALITY_P3 2.0", "    #define FXAA_QUALITY_P4 2.0", "    #define FXAA_QUALITY_P5 2.0", "    #define FXAA_QUALITY_P6 2.0", "    #define FXAA_QUALITY_P7 4.0", "    #define FXAA_QUALITY_P8 8.0", "#endif", "/*--------------------------------------------------------------------------*/", "#if (FXAA_QUALITY_PRESET == 27)", "    #define FXAA_QUALITY_PS 10", "    #define FXAA_QUALITY_P0 1.0", "    #define FXAA_QUALITY_P1 1.5", "    #define FXAA_QUALITY_P2 2.0", "    #define FXAA_QUALITY_P3 2.0", "    #define FXAA_QUALITY_P4 2.0", "    #define FXAA_QUALITY_P5 2.0", "    #define FXAA_QUALITY_P6 2.0", "    #define FXAA_QUALITY_P7 2.0", "    #define FXAA_QUALITY_P8 4.0", "    #define FXAA_QUALITY_P9 8.0", "#endif", "/*--------------------------------------------------------------------------*/", "#if (FXAA_QUALITY_PRESET == 28)", "    #define FXAA_QUALITY_PS 11", "    #define FXAA_QUALITY_P0 1.0", "    #define FXAA_QUALITY_P1 1.5", "    #define FXAA_QUALITY_P2 2.0", "    #define FXAA_QUALITY_P3 2.0", "    #define FXAA_QUALITY_P4 2.0", "    #define FXAA_QUALITY_P5 2.0", "    #define FXAA_QUALITY_P6 2.0", "    #define FXAA_QUALITY_P7 2.0", "    #define FXAA_QUALITY_P8 2.0", "    #define FXAA_QUALITY_P9 4.0", "    #define FXAA_QUALITY_P10 8.0", "#endif", "/*--------------------------------------------------------------------------*/", "#if (FXAA_QUALITY_PRESET == 29)", "    #define FXAA_QUALITY_PS 12", "    #define FXAA_QUALITY_P0 1.0", "    #define FXAA_QUALITY_P1 1.5", "    #define FXAA_QUALITY_P2 2.0", "    #define FXAA_QUALITY_P3 2.0", "    #define FXAA_QUALITY_P4 2.0", "    #define FXAA_QUALITY_P5 2.0", "    #define FXAA_QUALITY_P6 2.0", "    #define FXAA_QUALITY_P7 2.0", "    #define FXAA_QUALITY_P8 2.0", "    #define FXAA_QUALITY_P9 2.0", "    #define FXAA_QUALITY_P10 4.0", "    #define FXAA_QUALITY_P11 8.0", "#endif", "", "/*============================================================================", "                     FXAA QUALITY - EXTREME QUALITY", "============================================================================*/", "#if (FXAA_QUALITY_PRESET == 39)", "    #define FXAA_QUALITY_PS 12", "    #define FXAA_QUALITY_P0 1.0", "    #define FXAA_QUALITY_P1 1.0", "    #define FXAA_QUALITY_P2 1.0", "    #define FXAA_QUALITY_P3 1.0", "    #define FXAA_QUALITY_P4 1.0", "    #define FXAA_QUALITY_P5 1.5", "    #define FXAA_QUALITY_P6 2.0", "    #define FXAA_QUALITY_P7 2.0", "    #define FXAA_QUALITY_P8 2.0", "    #define FXAA_QUALITY_P9 2.0", "    #define FXAA_QUALITY_P10 4.0", "    #define FXAA_QUALITY_P11 8.0", "#endif", "", "", "", "/*============================================================================", "", "                                API PORTING", "", "============================================================================*/", "#if (FXAA_GLSL_100 == 1) || (FXAA_GLSL_120 == 1) || (FXAA_GLSL_130 == 1)", "    #define FxaaBool bool", "    #define FxaaDiscard discard", "    #define FxaaFloat float", "    #define FxaaFloat2 vec2", "    #define FxaaFloat3 vec3", "    #define FxaaFloat4 vec4", "    #define FxaaHalf float", "    #define FxaaHalf2 vec2", "    #define FxaaHalf3 vec3", "    #define FxaaHalf4 vec4", "    #define FxaaInt2 ivec2", "    #define FxaaSat(x) clamp(x, 0.0, 1.0)", "    #define FxaaTex sampler2D", "#else", "    #define FxaaBool bool", "    #define FxaaDiscard clip(-1)", "    #define FxaaFloat float", "    #define FxaaFloat2 float2", "    #define FxaaFloat3 float3", "    #define FxaaFloat4 float4", "    #define FxaaHalf half", "    #define FxaaHalf2 half2", "    #define FxaaHalf3 half3", "    #define FxaaHalf4 half4", "    #define FxaaSat(x) saturate(x)", "#endif", "/*--------------------------------------------------------------------------*/", "#if (FXAA_GLSL_100 == 1)", "  #define FxaaTexTop(t, p) texture2D(t, p, 0.0)", "  #define FxaaTexOff(t, p, o, r) texture2D(t, p + (o * r), 0.0)", "#endif", "/*--------------------------------------------------------------------------*/", "#if (FXAA_GLSL_120 == 1)", "    // Requires,", "    //  #version 120", "    // And at least,", "    //  #extension GL_EXT_gpu_shader4 : enable", "    //  (or set FXAA_FAST_PIXEL_OFFSET 1 to work like DX9)", "    #define FxaaTexTop(t, p) texture2DLod(t, p, 0.0)", "    #if (FXAA_FAST_PIXEL_OFFSET == 1)", "        #define FxaaTexOff(t, p, o, r) texture2DLodOffset(t, p, 0.0, o)", "    #else", "        #define FxaaTexOff(t, p, o, r) texture2DLod(t, p + (o * r), 0.0)", "    #endif", "    #if (FXAA_GATHER4_ALPHA == 1)", "        // use #extension GL_ARB_gpu_shader5 : enable", "        #define FxaaTexAlpha4(t, p) textureGather(t, p, 3)", "        #define FxaaTexOffAlpha4(t, p, o) textureGatherOffset(t, p, o, 3)", "        #define FxaaTexGreen4(t, p) textureGather(t, p, 1)", "        #define FxaaTexOffGreen4(t, p, o) textureGatherOffset(t, p, o, 1)", "    #endif", "#endif", "/*--------------------------------------------------------------------------*/", "#if (FXAA_GLSL_130 == 1)", "    // Requires \"#version 130\" or better", "    #define FxaaTexTop(t, p) textureLod(t, p, 0.0)", "    #define FxaaTexOff(t, p, o, r) textureLodOffset(t, p, 0.0, o)", "    #if (FXAA_GATHER4_ALPHA == 1)", "        // use #extension GL_ARB_gpu_shader5 : enable", "        #define FxaaTexAlpha4(t, p) textureGather(t, p, 3)", "        #define FxaaTexOffAlpha4(t, p, o) textureGatherOffset(t, p, o, 3)", "        #define FxaaTexGreen4(t, p) textureGather(t, p, 1)", "        #define FxaaTexOffGreen4(t, p, o) textureGatherOffset(t, p, o, 1)", "    #endif", "#endif", "/*--------------------------------------------------------------------------*/", "#if (FXAA_HLSL_3 == 1)", "    #define FxaaInt2 float2", "    #define FxaaTex sampler2D", "    #define FxaaTexTop(t, p) tex2Dlod(t, float4(p, 0.0, 0.0))", "    #define FxaaTexOff(t, p, o, r) tex2Dlod(t, float4(p + (o * r), 0, 0))", "#endif", "/*--------------------------------------------------------------------------*/", "#if (FXAA_HLSL_4 == 1)", "    #define FxaaInt2 int2", "    struct FxaaTex { SamplerState smpl; Texture2D tex; };", "    #define FxaaTexTop(t, p) t.tex.SampleLevel(t.smpl, p, 0.0)", "    #define FxaaTexOff(t, p, o, r) t.tex.SampleLevel(t.smpl, p, 0.0, o)", "#endif", "/*--------------------------------------------------------------------------*/", "#if (FXAA_HLSL_5 == 1)", "    #define FxaaInt2 int2", "    struct FxaaTex { SamplerState smpl; Texture2D tex; };", "    #define FxaaTexTop(t, p) t.tex.SampleLevel(t.smpl, p, 0.0)", "    #define FxaaTexOff(t, p, o, r) t.tex.SampleLevel(t.smpl, p, 0.0, o)", "    #define FxaaTexAlpha4(t, p) t.tex.GatherAlpha(t.smpl, p)", "    #define FxaaTexOffAlpha4(t, p, o) t.tex.GatherAlpha(t.smpl, p, o)", "    #define FxaaTexGreen4(t, p) t.tex.GatherGreen(t.smpl, p)", "    #define FxaaTexOffGreen4(t, p, o) t.tex.GatherGreen(t.smpl, p, o)", "#endif", "", "", "/*============================================================================", "                   GREEN AS LUMA OPTION SUPPORT FUNCTION", "============================================================================*/", "#if (FXAA_GREEN_AS_LUMA == 0)", "    FxaaFloat FxaaLuma(FxaaFloat4 rgba) { return rgba.w; }", "#else", "    FxaaFloat FxaaLuma(FxaaFloat4 rgba) { return rgba.y; }", "#endif", "", "", "", "", "/*============================================================================", "", "                             FXAA3 QUALITY - PC", "", "============================================================================*/", "#if (FXAA_PC == 1)", "/*--------------------------------------------------------------------------*/", "FxaaFloat4 FxaaPixelShader(", "    //", "    // Use noperspective interpolation here (turn off perspective interpolation).", "    // {xy} = center of pixel", "    FxaaFloat2 pos,", "    //", "    // Used only for FXAA Console, and not used on the 360 version.", "    // Use noperspective interpolation here (turn off perspective interpolation).", "    // {xy_} = upper left of pixel", "    // {_zw} = lower right of pixel", "    FxaaFloat4 fxaaConsolePosPos,", "    //", "    // Input color texture.", "    // {rgb_} = color in linear or perceptual color space", "    // if (FXAA_GREEN_AS_LUMA == 0)", "    //     {__a} = luma in perceptual color space (not linear)", "    FxaaTex tex,", "    //", "    // Only used on the optimized 360 version of FXAA Console.", "    // For everything but 360, just use the same input here as for \"tex\".", "    // For 360, same texture, just alias with a 2nd sampler.", "    // This sampler needs to have an exponent bias of -1.", "    FxaaTex fxaaConsole360TexExpBiasNegOne,", "    //", "    // Only used on the optimized 360 version of FXAA Console.", "    // For everything but 360, just use the same input here as for \"tex\".", "    // For 360, same texture, just alias with a 3nd sampler.", "    // This sampler needs to have an exponent bias of -2.", "    FxaaTex fxaaConsole360TexExpBiasNegTwo,", "    //", "    // Only used on FXAA Quality.", "    // This must be from a constant/uniform.", "    // {x_} = 1.0/screenWidthInPixels", "    // {_y} = 1.0/screenHeightInPixels", "    FxaaFloat2 fxaaQualityRcpFrame,", "    //", "    // Only used on FXAA Console.", "    // This must be from a constant/uniform.", "    // This effects sub-pixel AA quality and inversely sharpness.", "    //   Where N ranges between,", "    //     N = 0.50 (default)", "    //     N = 0.33 (sharper)", "    // {x__} = -N/screenWidthInPixels", "    // {_y_} = -N/screenHeightInPixels", "    // {_z_} =  N/screenWidthInPixels", "    // {__w} =  N/screenHeightInPixels", "    FxaaFloat4 fxaaConsoleRcpFrameOpt,", "    //", "    // Only used on FXAA Console.", "    // Not used on 360, but used on PS3 and PC.", "    // This must be from a constant/uniform.", "    // {x__} = -2.0/screenWidthInPixels", "    // {_y_} = -2.0/screenHeightInPixels", "    // {_z_} =  2.0/screenWidthInPixels", "    // {__w} =  2.0/screenHeightInPixels", "    FxaaFloat4 fxaaConsoleRcpFrameOpt2,", "    //", "    // Only used on FXAA Console.", "    // Only used on 360 in place of fxaaConsoleRcpFrameOpt2.", "    // This must be from a constant/uniform.", "    // {x__} =  8.0/screenWidthInPixels", "    // {_y_} =  8.0/screenHeightInPixels", "    // {_z_} = -4.0/screenWidthInPixels", "    // {__w} = -4.0/screenHeightInPixels", "    FxaaFloat4 fxaaConsole360RcpFrameOpt2,", "    //", "    // Only used on FXAA Quality.", "    // This used to be the FXAA_QUALITY_SUBPIX define.", "    // It is here now to allow easier tuning.", "    // Choose the amount of sub-pixel aliasing removal.", "    // This can effect sharpness.", "    //   1.00 - upper limit (softer)", "    //   0.75 - default amount of filtering", "    //   0.50 - lower limit (sharper, less sub-pixel aliasing removal)", "    //   0.25 - almost off", "    //   0.00 - completely off", "    FxaaFloat fxaaQualitySubpix,", "    //", "    // Only used on FXAA Quality.", "    // This used to be the FXAA_QUALITY_EDGE_THRESHOLD define.", "    // It is here now to allow easier tuning.", "    // The minimum amount of local contrast required to apply algorithm.", "    //   0.333 - too little (faster)", "    //   0.250 - low quality", "    //   0.166 - default", "    //   0.125 - high quality", "    //   0.063 - overkill (slower)", "    FxaaFloat fxaaQualityEdgeThreshold,", "    //", "    // Only used on FXAA Quality.", "    // This used to be the FXAA_QUALITY_EDGE_THRESHOLD_MIN define.", "    // It is here now to allow easier tuning.", "    // Trims the algorithm from processing darks.", "    //   0.0833 - upper limit (default, the start of visible unfiltered edges)", "    //   0.0625 - high quality (faster)", "    //   0.0312 - visible limit (slower)", "    // Special notes when using FXAA_GREEN_AS_LUMA,", "    //   Likely want to set this to zero.", "    //   As colors that are mostly not-green", "    //   will appear very dark in the green channel!", "    //   Tune by looking at mostly non-green content,", "    //   then start at zero and increase until aliasing is a problem.", "    FxaaFloat fxaaQualityEdgeThresholdMin,", "    //", "    // Only used on FXAA Console.", "    // This used to be the FXAA_CONSOLE_EDGE_SHARPNESS define.", "    // It is here now to allow easier tuning.", "    // This does not effect PS3, as this needs to be compiled in.", "    //   Use FXAA_CONSOLE_PS3_EDGE_SHARPNESS for PS3.", "    //   Due to the PS3 being ALU bound,", "    //   there are only three safe values here: 2 and 4 and 8.", "    //   These options use the shaders ability to a free *|/ by 2|4|8.", "    // For all other platforms can be a non-power of two.", "    //   8.0 is sharper (default!!!)", "    //   4.0 is softer", "    //   2.0 is really soft (good only for vector graphics inputs)", "    FxaaFloat fxaaConsoleEdgeSharpness,", "    //", "    // Only used on FXAA Console.", "    // This used to be the FXAA_CONSOLE_EDGE_THRESHOLD define.", "    // It is here now to allow easier tuning.", "    // This does not effect PS3, as this needs to be compiled in.", "    //   Use FXAA_CONSOLE_PS3_EDGE_THRESHOLD for PS3.", "    //   Due to the PS3 being ALU bound,", "    //   there are only two safe values here: 1/4 and 1/8.", "    //   These options use the shaders ability to a free *|/ by 2|4|8.", "    // The console setting has a different mapping than the quality setting.", "    // Other platforms can use other values.", "    //   0.125 leaves less aliasing, but is softer (default!!!)", "    //   0.25 leaves more aliasing, and is sharper", "    FxaaFloat fxaaConsoleEdgeThreshold,", "    //", "    // Only used on FXAA Console.", "    // This used to be the FXAA_CONSOLE_EDGE_THRESHOLD_MIN define.", "    // It is here now to allow easier tuning.", "    // Trims the algorithm from processing darks.", "    // The console setting has a different mapping than the quality setting.", "    // This only applies when FXAA_EARLY_EXIT is 1.", "    // This does not apply to PS3,", "    // PS3 was simplified to avoid more shader instructions.", "    //   0.06 - faster but more aliasing in darks", "    //   0.05 - default", "    //   0.04 - slower and less aliasing in darks", "    // Special notes when using FXAA_GREEN_AS_LUMA,", "    //   Likely want to set this to zero.", "    //   As colors that are mostly not-green", "    //   will appear very dark in the green channel!", "    //   Tune by looking at mostly non-green content,", "    //   then start at zero and increase until aliasing is a problem.", "    FxaaFloat fxaaConsoleEdgeThresholdMin,", "    //", "    // Extra constants for 360 FXAA Console only.", "    // Use zeros or anything else for other platforms.", "    // These must be in physical constant registers and NOT immedates.", "    // Immedates will result in compiler un-optimizing.", "    // {xyzw} = float4(1.0, -1.0, 0.25, -0.25)", "    FxaaFloat4 fxaaConsole360ConstDir", ") {", "/*--------------------------------------------------------------------------*/", "    FxaaFloat2 posM;", "    posM.x = pos.x;", "    posM.y = pos.y;", "    #if (FXAA_GATHER4_ALPHA == 1)", "        #if (FXAA_DISCARD == 0)", "            FxaaFloat4 rgbyM = FxaaTexTop(tex, posM);", "            #if (FXAA_GREEN_AS_LUMA == 0)", "                #define lumaM rgbyM.w", "            #else", "                #define lumaM rgbyM.y", "            #endif", "        #endif", "        #if (FXAA_GREEN_AS_LUMA == 0)", "            FxaaFloat4 luma4A = FxaaTexAlpha4(tex, posM);", "            FxaaFloat4 luma4B = FxaaTexOffAlpha4(tex, posM, FxaaInt2(-1, -1));", "        #else", "            FxaaFloat4 luma4A = FxaaTexGreen4(tex, posM);", "            FxaaFloat4 luma4B = FxaaTexOffGreen4(tex, posM, FxaaInt2(-1, -1));", "        #endif", "        #if (FXAA_DISCARD == 1)", "            #define lumaM luma4A.w", "        #endif", "        #define lumaE luma4A.z", "        #define lumaS luma4A.x", "        #define lumaSE luma4A.y", "        #define lumaNW luma4B.w", "        #define lumaN luma4B.z", "        #define lumaW luma4B.x", "    #else", "        FxaaFloat4 rgbyM = FxaaTexTop(tex, posM);", "        #if (FXAA_GREEN_AS_LUMA == 0)", "            #define lumaM rgbyM.w", "        #else", "            #define lumaM rgbyM.y", "        #endif", "        #if (FXAA_GLSL_100 == 1)", "          FxaaFloat lumaS = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 0.0, 1.0), fxaaQualityRcpFrame.xy));", "          FxaaFloat lumaE = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 1.0, 0.0), fxaaQualityRcpFrame.xy));", "          FxaaFloat lumaN = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 0.0,-1.0), fxaaQualityRcpFrame.xy));", "          FxaaFloat lumaW = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2(-1.0, 0.0), fxaaQualityRcpFrame.xy));", "        #else", "          FxaaFloat lumaS = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 0, 1), fxaaQualityRcpFrame.xy));", "          FxaaFloat lumaE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 1, 0), fxaaQualityRcpFrame.xy));", "          FxaaFloat lumaN = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 0,-1), fxaaQualityRcpFrame.xy));", "          FxaaFloat lumaW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1, 0), fxaaQualityRcpFrame.xy));", "        #endif", "    #endif", "/*--------------------------------------------------------------------------*/", "    FxaaFloat maxSM = max(lumaS, lumaM);", "    FxaaFloat minSM = min(lumaS, lumaM);", "    FxaaFloat maxESM = max(lumaE, maxSM);", "    FxaaFloat minESM = min(lumaE, minSM);", "    FxaaFloat maxWN = max(lumaN, lumaW);", "    FxaaFloat minWN = min(lumaN, lumaW);", "    FxaaFloat rangeMax = max(maxWN, maxESM);", "    FxaaFloat rangeMin = min(minWN, minESM);", "    FxaaFloat rangeMaxScaled = rangeMax * fxaaQualityEdgeThreshold;", "    FxaaFloat range = rangeMax - rangeMin;", "    FxaaFloat rangeMaxClamped = max(fxaaQualityEdgeThresholdMin, rangeMaxScaled);", "    FxaaBool earlyExit = range < rangeMaxClamped;", "/*--------------------------------------------------------------------------*/", "    if(earlyExit)", "        #if (FXAA_DISCARD == 1)", "            FxaaDiscard;", "        #else", "            return rgbyM;", "        #endif", "/*--------------------------------------------------------------------------*/", "    #if (FXAA_GATHER4_ALPHA == 0)", "        #if (FXAA_GLSL_100 == 1)", "          FxaaFloat lumaNW = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2(-1.0,-1.0), fxaaQualityRcpFrame.xy));", "          FxaaFloat lumaSE = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 1.0, 1.0), fxaaQualityRcpFrame.xy));", "          FxaaFloat lumaNE = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 1.0,-1.0), fxaaQualityRcpFrame.xy));", "          FxaaFloat lumaSW = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2(-1.0, 1.0), fxaaQualityRcpFrame.xy));", "        #else", "          FxaaFloat lumaNW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1,-1), fxaaQualityRcpFrame.xy));", "          FxaaFloat lumaSE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 1, 1), fxaaQualityRcpFrame.xy));", "          FxaaFloat lumaNE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 1,-1), fxaaQualityRcpFrame.xy));", "          FxaaFloat lumaSW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1, 1), fxaaQualityRcpFrame.xy));", "        #endif", "    #else", "        FxaaFloat lumaNE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(1, -1), fxaaQualityRcpFrame.xy));", "        FxaaFloat lumaSW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1, 1), fxaaQualityRcpFrame.xy));", "    #endif", "/*--------------------------------------------------------------------------*/", "    FxaaFloat lumaNS = lumaN + lumaS;", "    FxaaFloat lumaWE = lumaW + lumaE;", "    FxaaFloat subpixRcpRange = 1.0/range;", "    FxaaFloat subpixNSWE = lumaNS + lumaWE;", "    FxaaFloat edgeHorz1 = (-2.0 * lumaM) + lumaNS;", "    FxaaFloat edgeVert1 = (-2.0 * lumaM) + lumaWE;", "/*--------------------------------------------------------------------------*/", "    FxaaFloat lumaNESE = lumaNE + lumaSE;", "    FxaaFloat lumaNWNE = lumaNW + lumaNE;", "    FxaaFloat edgeHorz2 = (-2.0 * lumaE) + lumaNESE;", "    FxaaFloat edgeVert2 = (-2.0 * lumaN) + lumaNWNE;", "/*--------------------------------------------------------------------------*/", "    FxaaFloat lumaNWSW = lumaNW + lumaSW;", "    FxaaFloat lumaSWSE = lumaSW + lumaSE;", "    FxaaFloat edgeHorz4 = (abs(edgeHorz1) * 2.0) + abs(edgeHorz2);", "    FxaaFloat edgeVert4 = (abs(edgeVert1) * 2.0) + abs(edgeVert2);", "    FxaaFloat edgeHorz3 = (-2.0 * lumaW) + lumaNWSW;", "    FxaaFloat edgeVert3 = (-2.0 * lumaS) + lumaSWSE;", "    FxaaFloat edgeHorz = abs(edgeHorz3) + edgeHorz4;", "    FxaaFloat edgeVert = abs(edgeVert3) + edgeVert4;", "/*--------------------------------------------------------------------------*/", "    FxaaFloat subpixNWSWNESE = lumaNWSW + lumaNESE;", "    FxaaFloat lengthSign = fxaaQualityRcpFrame.x;", "    FxaaBool horzSpan = edgeHorz >= edgeVert;", "    FxaaFloat subpixA = subpixNSWE * 2.0 + subpixNWSWNESE;", "/*--------------------------------------------------------------------------*/", "    if(!horzSpan) lumaN = lumaW;", "    if(!horzSpan) lumaS = lumaE;", "    if(horzSpan) lengthSign = fxaaQualityRcpFrame.y;", "    FxaaFloat subpixB = (subpixA * (1.0/12.0)) - lumaM;", "/*--------------------------------------------------------------------------*/", "    FxaaFloat gradientN = lumaN - lumaM;", "    FxaaFloat gradientS = lumaS - lumaM;", "    FxaaFloat lumaNN = lumaN + lumaM;", "    FxaaFloat lumaSS = lumaS + lumaM;", "    FxaaBool pairN = abs(gradientN) >= abs(gradientS);", "    FxaaFloat gradient = max(abs(gradientN), abs(gradientS));", "    if(pairN) lengthSign = -lengthSign;", "    FxaaFloat subpixC = FxaaSat(abs(subpixB) * subpixRcpRange);", "/*--------------------------------------------------------------------------*/", "    FxaaFloat2 posB;", "    posB.x = posM.x;", "    posB.y = posM.y;", "    FxaaFloat2 offNP;", "    offNP.x = (!horzSpan) ? 0.0 : fxaaQualityRcpFrame.x;", "    offNP.y = ( horzSpan) ? 0.0 : fxaaQualityRcpFrame.y;", "    if(!horzSpan) posB.x += lengthSign * 0.5;", "    if( horzSpan) posB.y += lengthSign * 0.5;", "/*--------------------------------------------------------------------------*/", "    FxaaFloat2 posN;", "    posN.x = posB.x - offNP.x * FXAA_QUALITY_P0;", "    posN.y = posB.y - offNP.y * FXAA_QUALITY_P0;", "    FxaaFloat2 posP;", "    posP.x = posB.x + offNP.x * FXAA_QUALITY_P0;", "    posP.y = posB.y + offNP.y * FXAA_QUALITY_P0;", "    FxaaFloat subpixD = ((-2.0)*subpixC) + 3.0;", "    FxaaFloat lumaEndN = FxaaLuma(FxaaTexTop(tex, posN));", "    FxaaFloat subpixE = subpixC * subpixC;", "    FxaaFloat lumaEndP = FxaaLuma(FxaaTexTop(tex, posP));", "/*--------------------------------------------------------------------------*/", "    if(!pairN) lumaNN = lumaSS;", "    FxaaFloat gradientScaled = gradient * 1.0/4.0;", "    FxaaFloat lumaMM = lumaM - lumaNN * 0.5;", "    FxaaFloat subpixF = subpixD * subpixE;", "    FxaaBool lumaMLTZero = lumaMM < 0.0;", "/*--------------------------------------------------------------------------*/", "    lumaEndN -= lumaNN * 0.5;", "    lumaEndP -= lumaNN * 0.5;", "    FxaaBool doneN = abs(lumaEndN) >= gradientScaled;", "    FxaaBool doneP = abs(lumaEndP) >= gradientScaled;", "    if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P1;", "    if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P1;", "    FxaaBool doneNP = (!doneN) || (!doneP);", "    if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P1;", "    if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P1;", "/*--------------------------------------------------------------------------*/", "    if(doneNP) {", "        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));", "        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));", "        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;", "        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;", "        doneN = abs(lumaEndN) >= gradientScaled;", "        doneP = abs(lumaEndP) >= gradientScaled;", "        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P2;", "        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P2;", "        doneNP = (!doneN) || (!doneP);", "        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P2;", "        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P2;", "/*--------------------------------------------------------------------------*/", "        #if (FXAA_QUALITY_PS > 3)", "        if(doneNP) {", "            if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));", "            if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));", "            if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;", "            if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;", "            doneN = abs(lumaEndN) >= gradientScaled;", "            doneP = abs(lumaEndP) >= gradientScaled;", "            if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P3;", "            if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P3;", "            doneNP = (!doneN) || (!doneP);", "            if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P3;", "            if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P3;", "/*--------------------------------------------------------------------------*/", "            #if (FXAA_QUALITY_PS > 4)", "            if(doneNP) {", "                if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));", "                if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));", "                if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;", "                if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;", "                doneN = abs(lumaEndN) >= gradientScaled;", "                doneP = abs(lumaEndP) >= gradientScaled;", "                if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P4;", "                if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P4;", "                doneNP = (!doneN) || (!doneP);", "                if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P4;", "                if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P4;", "/*--------------------------------------------------------------------------*/", "                #if (FXAA_QUALITY_PS > 5)", "                if(doneNP) {", "                    if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));", "                    if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));", "                    if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;", "                    if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;", "                    doneN = abs(lumaEndN) >= gradientScaled;", "                    doneP = abs(lumaEndP) >= gradientScaled;", "                    if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P5;", "                    if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P5;", "                    doneNP = (!doneN) || (!doneP);", "                    if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P5;", "                    if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P5;", "/*--------------------------------------------------------------------------*/", "                    #if (FXAA_QUALITY_PS > 6)", "                    if(doneNP) {", "                        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));", "                        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));", "                        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;", "                        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;", "                        doneN = abs(lumaEndN) >= gradientScaled;", "                        doneP = abs(lumaEndP) >= gradientScaled;", "                        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P6;", "                        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P6;", "                        doneNP = (!doneN) || (!doneP);", "                        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P6;", "                        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P6;", "/*--------------------------------------------------------------------------*/", "                        #if (FXAA_QUALITY_PS > 7)", "                        if(doneNP) {", "                            if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));", "                            if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));", "                            if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;", "                            if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;", "                            doneN = abs(lumaEndN) >= gradientScaled;", "                            doneP = abs(lumaEndP) >= gradientScaled;", "                            if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P7;", "                            if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P7;", "                            doneNP = (!doneN) || (!doneP);", "                            if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P7;", "                            if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P7;", "/*--------------------------------------------------------------------------*/", "    #if (FXAA_QUALITY_PS > 8)", "    if(doneNP) {", "        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));", "        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));", "        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;", "        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;", "        doneN = abs(lumaEndN) >= gradientScaled;", "        doneP = abs(lumaEndP) >= gradientScaled;", "        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P8;", "        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P8;", "        doneNP = (!doneN) || (!doneP);", "        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P8;", "        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P8;", "/*--------------------------------------------------------------------------*/", "        #if (FXAA_QUALITY_PS > 9)", "        if(doneNP) {", "            if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));", "            if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));", "            if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;", "            if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;", "            doneN = abs(lumaEndN) >= gradientScaled;", "            doneP = abs(lumaEndP) >= gradientScaled;", "            if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P9;", "            if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P9;", "            doneNP = (!doneN) || (!doneP);", "            if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P9;", "            if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P9;", "/*--------------------------------------------------------------------------*/", "            #if (FXAA_QUALITY_PS > 10)", "            if(doneNP) {", "                if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));", "                if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));", "                if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;", "                if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;", "                doneN = abs(lumaEndN) >= gradientScaled;", "                doneP = abs(lumaEndP) >= gradientScaled;", "                if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P10;", "                if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P10;", "                doneNP = (!doneN) || (!doneP);", "                if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P10;", "                if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P10;", "/*--------------------------------------------------------------------------*/", "                #if (FXAA_QUALITY_PS > 11)", "                if(doneNP) {", "                    if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));", "                    if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));", "                    if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;", "                    if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;", "                    doneN = abs(lumaEndN) >= gradientScaled;", "                    doneP = abs(lumaEndP) >= gradientScaled;", "                    if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P11;", "                    if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P11;", "                    doneNP = (!doneN) || (!doneP);", "                    if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P11;", "                    if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P11;", "/*--------------------------------------------------------------------------*/", "                    #if (FXAA_QUALITY_PS > 12)", "                    if(doneNP) {", "                        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));", "                        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));", "                        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;", "                        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;", "                        doneN = abs(lumaEndN) >= gradientScaled;", "                        doneP = abs(lumaEndP) >= gradientScaled;", "                        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P12;", "                        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P12;", "                        doneNP = (!doneN) || (!doneP);", "                        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P12;", "                        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P12;", "/*--------------------------------------------------------------------------*/", "                    }", "                    #endif", "/*--------------------------------------------------------------------------*/", "                }", "                #endif", "/*--------------------------------------------------------------------------*/", "            }", "            #endif", "/*--------------------------------------------------------------------------*/", "        }", "        #endif", "/*--------------------------------------------------------------------------*/", "    }", "    #endif", "/*--------------------------------------------------------------------------*/", "                        }", "                        #endif", "/*--------------------------------------------------------------------------*/", "                    }", "                    #endif", "/*--------------------------------------------------------------------------*/", "                }", "                #endif", "/*--------------------------------------------------------------------------*/", "            }", "            #endif", "/*--------------------------------------------------------------------------*/", "        }", "        #endif", "/*--------------------------------------------------------------------------*/", "    }", "/*--------------------------------------------------------------------------*/", "    FxaaFloat dstN = posM.x - posN.x;", "    FxaaFloat dstP = posP.x - posM.x;", "    if(!horzSpan) dstN = posM.y - posN.y;", "    if(!horzSpan) dstP = posP.y - posM.y;", "/*--------------------------------------------------------------------------*/", "    FxaaBool goodSpanN = (lumaEndN < 0.0) != lumaMLTZero;", "    FxaaFloat spanLength = (dstP + dstN);", "    FxaaBool goodSpanP = (lumaEndP < 0.0) != lumaMLTZero;", "    FxaaFloat spanLengthRcp = 1.0/spanLength;", "/*--------------------------------------------------------------------------*/", "    FxaaBool directionN = dstN < dstP;", "    FxaaFloat dst = min(dstN, dstP);", "    FxaaBool goodSpan = directionN ? goodSpanN : goodSpanP;", "    FxaaFloat subpixG = subpixF * subpixF;", "    FxaaFloat pixelOffset = (dst * (-spanLengthRcp)) + 0.5;", "    FxaaFloat subpixH = subpixG * fxaaQualitySubpix;", "/*--------------------------------------------------------------------------*/", "    FxaaFloat pixelOffsetGood = goodSpan ? pixelOffset : 0.0;", "    FxaaFloat pixelOffsetSubpix = max(pixelOffsetGood, subpixH);", "    if(!horzSpan) posM.x += pixelOffsetSubpix * lengthSign;", "    if( horzSpan) posM.y += pixelOffsetSubpix * lengthSign;", "    #if (FXAA_DISCARD == 1)", "        return FxaaTexTop(tex, posM);", "    #else", "        return FxaaFloat4(FxaaTexTop(tex, posM).xyz, lumaM);", "    #endif", "}", "/*==========================================================================*/", "#endif", "", "void main() {", "  gl_FragColor = FxaaPixelShader(", "    vUv,", "    vec4(0.0),", "    tDiffuse,", "    tDiffuse,", "    tDiffuse,", "    resolution,", "    vec4(0.0),", "    vec4(0.0),", "    vec4(0.0),", "    0.75,", "    0.166,", "    0.0833,", "    0.0,", "    0.0,", "    0.0,", "    vec4(0.0)", "  );", "", "  // TODO avoid querying texture twice for same texel", "  gl_FragColor.a = texture2D(tDiffuse, vUv).a;", "}"].join("\n")

	};

	var _extends$1 = function _extends(des, src, over) {

		var res = _extend(des, src, over);

		function _extend(des, src, over) {

			var override = true;
			if (over === false) {

				override = false;
			}
			if (src instanceof Array) {

				for (var i = 0, len = src.length; i < len; i++) {
					_extend(des, src[i], override);
				}
			}
			for (var _i in src) {

				if (override || !(_i in des)) {

					des[_i] = src[_i];
				}
			}
			return des;
		}
		for (var i in src) {

			delete res[i];
		}
		return res;
	};

	var rndInt = function rndInt(max) {

		return Math.floor(Math.random() * max);
	};

	var rndString = function rndString(len) {

		if (len <= 0) {

			return '';
		}
		len = len - 1 || 31;
		var $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var maxPos = $chars.length + 1;
		var pwd = $chars.charAt(Math.floor(Math.random() * (maxPos - 10)));
		for (var i = 0; i < len; i++) {

			pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
		}
		return pwd;
	};

	var geoToCartesian = function geoToCartesian() {
		var lat = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
		var lon = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		var radius = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;


		lat *= Math.PI / 180;
		lon *= Math.PI / 180;
		return new three.Vector3(-radius * Math.cos(lat) * Math.cos(lon), radius * Math.sin(lat), radius * Math.cos(lat) * Math.sin(lon));
	};

	var Util = {
		extend: _extends$1,
		rndInt: rndInt,
		rndString: rndString,
		geoToCartesian: geoToCartesian
	};

	/* eslint-disable */

	// //export * from './thirdparty/three.module.js';

	exports.DefaultSettings = DefaultSettings;
	exports.App = App;
	exports.Bind = Bind;
	exports.FBOWorld = FBOWorld;
	exports.LoopManager = LoopManager;
	exports.Monitor = Monitor;
	exports.QRCode = QRCode;
	exports.Transitioner = Transitioner;
	exports.View = View;
	exports.VR = VR;
	exports.World = World;
	exports.NotFunctionError = NotFunctionError;
	exports.EventManager = EventManager;
	exports.Events = Events;
	exports.FBOEventMapper = FBOEventMapper;
	exports.Signal = Signal;
	exports.GUI = GUI;
	exports.Body = Body;
	exports.Txt = Txt;
	exports.Div = Div;
	exports.LoaderFactory = LoaderFactory;
	exports.EffectComposer = EffectComposer;
	exports.AfterimagePass = AfterimagePass;
	exports.Pass = Pass;
	exports.DotScreenPass = DotScreenPass;
	exports.RenderPass = RenderPass;
	exports.ShaderPass = ShaderPass;
	exports.GlitchPass = GlitchPass;
	exports.OutlinePass = OutlinePass;
	exports.WatercolorPass = WatercolorPass;
	exports.TestPass = TestPass;
	exports.AfterimageShader = AfterimageShader;
	exports.CopyShader = CopyShader;
	exports.DotScreenShader = DotScreenShader;
	exports.FXAAShader = FXAAShader;
	exports.GlitchShader = GlitchShader;
	exports.WatercolorShader = WatercolorShader;
	exports.TestShader = TestShader;
	exports.Util = Util;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=nova.js.map
