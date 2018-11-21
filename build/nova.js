(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three')) :
	typeof define === 'function' && define.amd ? define(['exports', 'three'], factory) :
	(factory((global.NOVA = {}),global.THREE));
}(this, (function (exports,three) { 'use strict';

	//适合大部分WebGL的APP设置
	var DefaultSettings = {
	  parent: document.body,
	  //APP所在DOM容器
	  setCommonCSS: true,
	  //设置默认CSS样式，无法滚动，超出区域不显示，取消所有内外边距
	  autoStart: true,
	  //自动执行渲染循环和逻辑循环
	  autoResize: true,
	  //自动拉伸自适应不同屏幕分辨率
	  VRSupport: false,
	  //是否加载VR支持模块
	  renderer: {
	    clearColor: 0x000000,
	    //渲染器的默认清除颜色
	    clearAlpha: 1,
	    //渲染器的默认清除颜色的透明度
	    pixelRatio: window.devicePixelRatio || 1,
	    //用于移动平台的清晰度
	    precision: "highp",
	    // 渲染精细度，默认为高
	    antialias: true,
	    //是否开启抗锯齿
	    alpha: false,
	    // 渲染器是否保存alpha缓冲
	    logarithmicDepthBuffer: false,
	    // 逻辑深度缓冲
	    preserveDrawingBuffer: false
	  },
	  normalEventList: ["click", "mousedown", "mouseup", "touchstart", "touchend", "touchmove", "mousemove"],
	  //默认开启的原生事件监听，不建议将所有的事件监听都写在里面，每一个事件监听都会增加一次射线法碰撞检测，如果不必要的事件过多会降低性能
	  hammerEventList: "press tap pressup pan swipe" //默认hammer手势事件的监听，同normalEventList一样，用到什么加入什么，不要一大堆东西全塞进去

	};

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  return Constructor;
	}

	function _defineProperty(obj, key, value) {
	  if (key in obj) {
	    Object.defineProperty(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	  } else {
	    obj[key] = value;
	  }

	  return obj;
	}

	function _objectSpread(target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i] != null ? arguments[i] : {};
	    var ownKeys = Object.keys(source);

	    if (typeof Object.getOwnPropertySymbols === 'function') {
	      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
	        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
	      }));
	    }

	    ownKeys.forEach(function (key) {
	      _defineProperty(target, key, source[key]);
	    });
	  }

	  return target;
	}

	function _inherits(subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function");
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) _setPrototypeOf(subClass, superClass);
	}

	function _getPrototypeOf(o) {
	  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
	    return o.__proto__ || Object.getPrototypeOf(o);
	  };
	  return _getPrototypeOf(o);
	}

	function _setPrototypeOf(o, p) {
	  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
	    o.__proto__ = p;
	    return o;
	  };

	  return _setPrototypeOf(o, p);
	}

	function isNativeReflectConstruct() {
	  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
	  if (Reflect.construct.sham) return false;
	  if (typeof Proxy === "function") return true;

	  try {
	    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
	    return true;
	  } catch (e) {
	    return false;
	  }
	}

	function _construct(Parent, args, Class) {
	  if (isNativeReflectConstruct()) {
	    _construct = Reflect.construct;
	  } else {
	    _construct = function _construct(Parent, args, Class) {
	      var a = [null];
	      a.push.apply(a, args);
	      var Constructor = Function.bind.apply(Parent, a);
	      var instance = new Constructor();
	      if (Class) _setPrototypeOf(instance, Class.prototype);
	      return instance;
	    };
	  }

	  return _construct.apply(null, arguments);
	}

	function _isNativeFunction(fn) {
	  return Function.toString.call(fn).indexOf("[native code]") !== -1;
	}

	function _wrapNativeSuper(Class) {
	  var _cache = typeof Map === "function" ? new Map() : undefined;

	  _wrapNativeSuper = function _wrapNativeSuper(Class) {
	    if (Class === null || !_isNativeFunction(Class)) return Class;

	    if (typeof Class !== "function") {
	      throw new TypeError("Super expression must either be null or a function");
	    }

	    if (typeof _cache !== "undefined") {
	      if (_cache.has(Class)) return _cache.get(Class);

	      _cache.set(Class, Wrapper);
	    }

	    function Wrapper() {
	      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
	    }

	    Wrapper.prototype = Object.create(Class.prototype, {
	      constructor: {
	        value: Wrapper,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	    return _setPrototypeOf(Wrapper, Class);
	  };

	  return _wrapNativeSuper(Class);
	}

	function _assertThisInitialized(self) {
	  if (self === void 0) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return self;
	}

	function _possibleConstructorReturn(self, call) {
	  if (call && (typeof call === "object" || typeof call === "function")) {
	    return call;
	  }

	  return _assertThisInitialized(self);
	}

	function _slicedToArray(arr, i) {
	  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
	}

	function _arrayWithHoles(arr) {
	  if (Array.isArray(arr)) return arr;
	}

	function _iterableToArrayLimit(arr, i) {
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
	      if (!_n && _i["return"] != null) _i["return"]();
	    } finally {
	      if (_d) throw _e;
	    }
	  }

	  return _arr;
	}

	function _nonIterableRest() {
	  throw new TypeError("Invalid attempt to destructure non-iterable instance");
	}

	var NotFunctionError =
	/*#__PURE__*/
	function (_Error) {
	  _inherits(NotFunctionError, _Error);

	  function NotFunctionError(message) {
	    var _this;

	    _classCallCheck(this, NotFunctionError);

	    _this = _possibleConstructorReturn(this, _getPrototypeOf(NotFunctionError).call(this, message));
	    _this.name = 'NotFunctionError';
	    _this.message = message || 'The object is not a function.';
	    return _this;
	  }

	  return NotFunctionError;
	}(_wrapNativeSuper(Error));

	var LoopManager = function LoopManager() {
	  var _this = this;

	  var cycleLevel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

	  _classCallCheck(this, LoopManager);

	  this.update = function (time) {
	    _this.times++;

	    if (_this.disable || _this.times % _this.cycleLevel !== 0) {
	      return;
	    }

	    _this.functionMap.forEach(function (value) {
	      value(time);
	    });
	  };

	  this.add = function (func, key) {
	    if (typeof func !== 'function') {
	      throw new NotFunctionError();
	    } else {
	      if (func.prototype) {
	        console.warn(func, "The function is not an arrrow function. It'll be unsafe when using 'this' in it.");
	      }

	      if (key) {
	        _this.functionMap.set(key, func);
	      } else {
	        key = Symbol();

	        _this.functionMap.set(key, func);

	        return key;
	      }
	    }
	  };

	  this.removeAll = function () {
	    _this.functionMap.clear();
	  };

	  this.remove = function (funcOrKey) {
	    if (typeof funcOrKey === 'function') {
	      _this.functionMap.forEach(function (value, key) {
	        if (value === funcOrKey) {
	          return _this.functionMap.delete(key);
	        }
	      });

	      return false;
	    } else {
	      return _this.functionMap.delete(funcOrKey);
	    }
	  };

	  //当它是true，不执行该循环
	  this.disable = false; //记录循环次数

	  this.times = 0; //每隔多少循环执行一次update，用于调整fps。数字越大，fps越低

	  this.cycleLevel = cycleLevel <= 1 ? 1 : cycleLevel;
	  this.functionMap = new Map();
	};

	var EventManager = function EventManager(world) {
	  var _this = this;

	  _classCallCheck(this, EventManager);

	  this.toNovaEvent = function (event) {
	    return {
	      changedPointers: [event],
	      center: new three.Vector2(event.clientX, event.clientY),
	      type: event.type,
	      target: event.target
	    };
	  };

	  this.raycastCheck = function (event) {
	    var vec2 = new three.Vector2(event.center.x / _this.world.app.getWorldWidth() * 2 - 1, 1 - event.center.y / _this.world.app.getWorldHeight() * 2);

	    _this.raycaster.setFromCamera(vec2, _this.world.camera);

	    var receiverMap;

	    if (_this.world.receivers instanceof Array) {
	      receiverMap = new Map();
	      receiverMap.set(Symbol(), _this.world.receivers);
	    } else if (_this.world.receivers instanceof Map) {
	      receiverMap = _this.world.receivers;
	    }

	    var intersect;
	    var _iteratorNormalCompletion = true;
	    var _didIteratorError = false;
	    var _iteratorError = undefined;

	    try {
	      for (var _iterator = receiverMap.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	        var receivers = _step.value;

	        var intersects = _this.raycaster.intersectObjects(receivers, _this.isDeep);

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
	      _didIteratorError = true;
	      _iteratorError = err;
	    } finally {
	      try {
	        if (!_iteratorNormalCompletion && _iterator.return != null) {
	          _iterator.return();
	        }
	      } finally {
	        if (_didIteratorError) {
	          throw _iteratorError;
	        }
	      }
	    }
	  };

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
	  var _iteratorNormalCompletion2 = true;
	  var _didIteratorError2 = false;
	  var _iteratorError2 = undefined;

	  try {
	    for (var _iterator2 = normalEventList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	      var eventItem = _step2.value;
	      world.app.parent.addEventListener(eventItem, function (event) {
	        if (_this.disable) return;

	        _this.raycastCheck(_this.toNovaEvent(event));
	      });
	    }
	  } catch (err) {
	    _didIteratorError2 = true;
	    _iteratorError2 = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
	        _iterator2.return();
	      }
	    } finally {
	      if (_didIteratorError2) {
	        throw _iteratorError2;
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
	};

	var World = function World(app, camera, clearColor) {
	  var _this = this;

	  _classCallCheck(this, World);

	  this.update = function (time) {
	    _this.logicLoop.update(time);

	    _this.renderLoop.update(time);
	  };

	  this.resize = function (width, height) {
	    if (_this.camera.type === 'PerspectiveCamera') {
	      _this.camera.aspect = width / height;

	      _this.camera.updateProjectionMatrix();
	    } else {
	      _this.camera.left = -width / 2;
	      _this.camera.right = width / 2;
	      _this.camera.top = height / 2;
	      _this.camera.bottom = -height / 2;

	      _this.camera.updateProjectionMatrix();
	    }
	  };

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
	};

	var APP_STOP = 0;
	var APP_RUNNING = 1;
	var APP_PAUSE = 2;
	var VERSION = '0.1.3';
	console.log("Nova framework for Three.js, version: %c " + VERSION, "color:blue");

	var VR =
	/*#__PURE__*/
	function () {
	  function VR(app) {
	    _classCallCheck(this, VR);

	    this.app = app;
	    this.display = undefined;
	    this.polyfill = undefined;
	    this.isOpenVR = false;
	    this.vrEffect = undefined;
	    this.getVRDisplay();
	    this.createVREffect();
	  }

	  _createClass(VR, [{
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
	        var param, name, value;

	        for (var i = 0; i < params.length; i++) {
	          param = params[i].split('=');
	          name = param[0];
	          value = param[1]; // All config values are either boolean or float

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
	      this.display.requestPresent([{
	        source: this.app.renderer.domElement
	      }]);
	    }
	  }, {
	    key: "close",
	    value: function close() {
	      this.app.renderLoop.remove(this.vrEffect.updateId);
	    }
	  }]);

	  return VR;
	}();

	/**
	 * A faster alternative to `Function#apply`, this function invokes `func`
	 * with the `this` binding of `thisArg` and the arguments of `args`.
	 *
	 * @private
	 * @param {Function} func The function to invoke.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {Array} args The arguments to invoke `func` with.
	 * @returns {*} Returns the result of `func`.
	 */
	function apply(func, thisArg, args) {
	  switch (args.length) {
	    case 0:
	      return func.call(thisArg);

	    case 1:
	      return func.call(thisArg, args[0]);

	    case 2:
	      return func.call(thisArg, args[0], args[1]);

	    case 3:
	      return func.call(thisArg, args[0], args[1], args[2]);
	  }

	  return func.apply(thisArg, args);
	}

	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */
	function identity(value) {
	  return value;
	}

	/* Built-in method references for those with the same name as other `lodash` methods. */

	var nativeMax = Math.max;
	/**
	 * A specialized version of `baseRest` which transforms the rest array.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @param {Function} transform The rest array transform.
	 * @returns {Function} Returns the new function.
	 */

	function overRest(func, start, transform) {
	  start = nativeMax(start === undefined ? func.length - 1 : start, 0);
	  return function () {
	    var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        array = Array(length);

	    while (++index < length) {
	      array[index] = args[start + index];
	    }

	    index = -1;
	    var otherArgs = Array(start + 1);

	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }

	    otherArgs[start] = transform(array);
	    return apply(func, this, otherArgs);
	  };
	}

	/**
	 * Creates a function that returns `value`.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {*} value The value to return from the new function.
	 * @returns {Function} Returns the new constant function.
	 * @example
	 *
	 * var objects = _.times(2, _.constant({ 'a': 1 }));
	 *
	 * console.log(objects);
	 * // => [{ 'a': 1 }, { 'a': 1 }]
	 *
	 * console.log(objects[0] === objects[1]);
	 * // => true
	 */
	function constant(value) {
	  return function () {
	    return value;
	  };
	}

	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

	/** Detect free variable `self`. */

	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
	/** Used as a reference to the global object. */

	var root = freeGlobal || freeSelf || Function('return this')();

	/** Built-in value references. */

	var Symbol$1 = root.Symbol;

	/** Used for built-in method references. */

	var objectProto = Object.prototype;
	/** Used to check objects for own properties. */

	var hasOwnProperty = objectProto.hasOwnProperty;
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */

	var nativeObjectToString = objectProto.toString;
	/** Built-in value references. */

	var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;
	/**
	 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the raw `toStringTag`.
	 */

	function getRawTag(value) {
	  var isOwn = hasOwnProperty.call(value, symToStringTag),
	      tag = value[symToStringTag];

	  try {
	    value[symToStringTag] = undefined;
	  } catch (e) {}

	  var result = nativeObjectToString.call(value);

	  {
	    if (isOwn) {
	      value[symToStringTag] = tag;
	    } else {
	      delete value[symToStringTag];
	    }
	  }

	  return result;
	}

	/** Used for built-in method references. */
	var objectProto$1 = Object.prototype;
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */

	var nativeObjectToString$1 = objectProto$1.toString;
	/**
	 * Converts `value` to a string using `Object.prototype.toString`.
	 *
	 * @private
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 */

	function objectToString(value) {
	  return nativeObjectToString$1.call(value);
	}

	/** `Object#toString` result references. */

	var nullTag = '[object Null]',
	    undefinedTag = '[object Undefined]';
	/** Built-in value references. */

	var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;
	/**
	 * The base implementation of `getTag` without fallbacks for buggy environments.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */

	function baseGetTag(value) {
	  if (value == null) {
	    return value === undefined ? undefinedTag : nullTag;
	  }

	  return symToStringTag$1 && symToStringTag$1 in Object(value) ? getRawTag(value) : objectToString(value);
	}

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return value != null && (type == 'object' || type == 'function');
	}

	/** `Object#toString` result references. */

	var asyncTag = '[object AsyncFunction]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    proxyTag = '[object Proxy]';
	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */

	function isFunction(value) {
	  if (!isObject(value)) {
	    return false;
	  } // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 9 which returns 'object' for typed arrays and other constructors.


	  var tag = baseGetTag(value);
	  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
	}

	/** Used to detect overreaching core-js shims. */

	var coreJsData = root['__core-js_shared__'];

	/** Used to detect methods masquerading as native. */

	var maskSrcKey = function () {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	  return uid ? 'Symbol(src)_1.' + uid : '';
	}();
	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */


	function isMasked(func) {
	  return !!maskSrcKey && maskSrcKey in func;
	}

	/** Used for built-in method references. */
	var funcProto = Function.prototype;
	/** Used to resolve the decompiled source of functions. */

	var funcToString = funcProto.toString;
	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to convert.
	 * @returns {string} Returns the source code.
	 */

	function toSource(func) {
	  if (func != null) {
	    try {
	      return funcToString.call(func);
	    } catch (e) {}

	    try {
	      return func + '';
	    } catch (e) {}
	  }

	  return '';
	}

	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */

	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
	/** Used to detect host constructors (Safari). */

	var reIsHostCtor = /^\[object .+?Constructor\]$/;
	/** Used for built-in method references. */

	var funcProto$1 = Function.prototype,
	    objectProto$2 = Object.prototype;
	/** Used to resolve the decompiled source of functions. */

	var funcToString$1 = funcProto$1.toString;
	/** Used to check objects for own properties. */

	var hasOwnProperty$1 = objectProto$2.hasOwnProperty;
	/** Used to detect if a method is native. */

	var reIsNative = RegExp('^' + funcToString$1.call(hasOwnProperty$1).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
	/**
	 * The base implementation of `_.isNative` without bad shim checks.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 */

	function baseIsNative(value) {
	  if (!isObject(value) || isMasked(value)) {
	    return false;
	  }

	  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
	}

	/**
	 * Gets the value at `key` of `object`.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function getValue(object, key) {
	  return object == null ? undefined : object[key];
	}

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */

	function getNative(object, key) {
	  var value = getValue(object, key);
	  return baseIsNative(value) ? value : undefined;
	}

	var defineProperty = function () {
	  try {
	    var func = getNative(Object, 'defineProperty');
	    func({}, '', {});
	    return func;
	  } catch (e) {}
	}();

	/**
	 * The base implementation of `setToString` without support for hot loop shorting.
	 *
	 * @private
	 * @param {Function} func The function to modify.
	 * @param {Function} string The `toString` result.
	 * @returns {Function} Returns `func`.
	 */

	var baseSetToString = !defineProperty ? identity : function (func, string) {
	  return defineProperty(func, 'toString', {
	    'configurable': true,
	    'enumerable': false,
	    'value': constant(string),
	    'writable': true
	  });
	};

	/** Used to detect hot functions by number of calls within a span of milliseconds. */
	var HOT_COUNT = 800,
	    HOT_SPAN = 16;
	/* Built-in method references for those with the same name as other `lodash` methods. */

	var nativeNow = Date.now;
	/**
	 * Creates a function that'll short out and invoke `identity` instead
	 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
	 * milliseconds.
	 *
	 * @private
	 * @param {Function} func The function to restrict.
	 * @returns {Function} Returns the new shortable function.
	 */

	function shortOut(func) {
	  var count = 0,
	      lastCalled = 0;
	  return function () {
	    var stamp = nativeNow(),
	        remaining = HOT_SPAN - (stamp - lastCalled);
	    lastCalled = stamp;

	    if (remaining > 0) {
	      if (++count >= HOT_COUNT) {
	        return arguments[0];
	      }
	    } else {
	      count = 0;
	    }

	    return func.apply(undefined, arguments);
	  };
	}

	/**
	 * Sets the `toString` method of `func` to return `string`.
	 *
	 * @private
	 * @param {Function} func The function to modify.
	 * @param {Function} string The `toString` result.
	 * @returns {Function} Returns `func`.
	 */

	var setToString = shortOut(baseSetToString);

	/**
	 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 */

	function baseRest(func, start) {
	  return setToString(overRest(func, start, identity), func + '');
	}

	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear() {
	  this.__data__ = [];
	  this.size = 0;
	}

	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || value !== value && other !== other;
	}

	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */

	function assocIndexOf(array, key) {
	  var length = array.length;

	  while (length--) {
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }

	  return -1;
	}

	/** Used for built-in method references. */

	var arrayProto = Array.prototype;
	/** Built-in value references. */

	var splice = arrayProto.splice;
	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */

	function listCacheDelete(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    return false;
	  }

	  var lastIndex = data.length - 1;

	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }

	  --this.size;
	  return true;
	}

	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */

	function listCacheGet(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	  return index < 0 ? undefined : data[index][1];
	}

	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */

	function listCacheHas(key) {
	  return assocIndexOf(this.__data__, key) > -1;
	}

	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */

	function listCacheSet(key, value) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    ++this.size;
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }

	  return this;
	}

	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */

	function ListCache(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;
	  this.clear();

	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	} // Add methods to `ListCache`.


	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;

	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */

	function stackClear() {
	  this.__data__ = new ListCache();
	  this.size = 0;
	}

	/**
	 * Removes `key` and its value from the stack.
	 *
	 * @private
	 * @name delete
	 * @memberOf Stack
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function stackDelete(key) {
	  var data = this.__data__,
	      result = data['delete'](key);
	  this.size = data.size;
	  return result;
	}

	/**
	 * Gets the stack value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Stack
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function stackGet(key) {
	  return this.__data__.get(key);
	}

	/**
	 * Checks if a stack value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Stack
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function stackHas(key) {
	  return this.__data__.has(key);
	}

	/* Built-in method references that are verified to be native. */

	var Map$1 = getNative(root, 'Map');

	/* Built-in method references that are verified to be native. */

	var nativeCreate = getNative(Object, 'create');

	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */

	function hashClear() {
	  this.__data__ = nativeCreate ? nativeCreate(null) : {};
	  this.size = 0;
	}

	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function hashDelete(key) {
	  var result = this.has(key) && delete this.__data__[key];
	  this.size -= result ? 1 : 0;
	  return result;
	}

	/** Used to stand-in for `undefined` hash values. */

	var HASH_UNDEFINED = '__lodash_hash_undefined__';
	/** Used for built-in method references. */

	var objectProto$3 = Object.prototype;
	/** Used to check objects for own properties. */

	var hasOwnProperty$2 = objectProto$3.hasOwnProperty;
	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */

	function hashGet(key) {
	  var data = this.__data__;

	  if (nativeCreate) {
	    var result = data[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }

	  return hasOwnProperty$2.call(data, key) ? data[key] : undefined;
	}

	/** Used for built-in method references. */

	var objectProto$4 = Object.prototype;
	/** Used to check objects for own properties. */

	var hasOwnProperty$3 = objectProto$4.hasOwnProperty;
	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */

	function hashHas(key) {
	  var data = this.__data__;
	  return nativeCreate ? data[key] !== undefined : hasOwnProperty$3.call(data, key);
	}

	/** Used to stand-in for `undefined` hash values. */

	var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';
	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */

	function hashSet(key, value) {
	  var data = this.__data__;
	  this.size += this.has(key) ? 0 : 1;
	  data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED$1 : value;
	  return this;
	}

	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */

	function Hash(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;
	  this.clear();

	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	} // Add methods to `Hash`.


	Hash.prototype.clear = hashClear;
	Hash.prototype['delete'] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;

	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */

	function mapCacheClear() {
	  this.size = 0;
	  this.__data__ = {
	    'hash': new Hash(),
	    'map': new (Map$1 || ListCache)(),
	    'string': new Hash()
	  };
	}

	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = typeof value;
	  return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
	}

	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */

	function getMapData(map, key) {
	  var data = map.__data__;
	  return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
	}

	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */

	function mapCacheDelete(key) {
	  var result = getMapData(this, key)['delete'](key);
	  this.size -= result ? 1 : 0;
	  return result;
	}

	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */

	function mapCacheGet(key) {
	  return getMapData(this, key).get(key);
	}

	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */

	function mapCacheHas(key) {
	  return getMapData(this, key).has(key);
	}

	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */

	function mapCacheSet(key, value) {
	  var data = getMapData(this, key),
	      size = data.size;
	  data.set(key, value);
	  this.size += data.size == size ? 0 : 1;
	  return this;
	}

	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */

	function MapCache(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;
	  this.clear();

	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	} // Add methods to `MapCache`.


	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype['delete'] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;

	/** Used as the size to enable large array optimizations. */

	var LARGE_ARRAY_SIZE = 200;
	/**
	 * Sets the stack `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Stack
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the stack cache instance.
	 */

	function stackSet(key, value) {
	  var data = this.__data__;

	  if (data instanceof ListCache) {
	    var pairs = data.__data__;

	    if (!Map$1 || pairs.length < LARGE_ARRAY_SIZE - 1) {
	      pairs.push([key, value]);
	      this.size = ++data.size;
	      return this;
	    }

	    data = this.__data__ = new MapCache(pairs);
	  }

	  data.set(key, value);
	  this.size = data.size;
	  return this;
	}

	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */

	function Stack(entries) {
	  var data = this.__data__ = new ListCache(entries);
	  this.size = data.size;
	} // Add methods to `Stack`.


	Stack.prototype.clear = stackClear;
	Stack.prototype['delete'] = stackDelete;
	Stack.prototype.get = stackGet;
	Stack.prototype.has = stackHas;
	Stack.prototype.set = stackSet;

	/**
	 * The base implementation of `assignValue` and `assignMergeValue` without
	 * value checks.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */

	function baseAssignValue(object, key, value) {
	  if (key == '__proto__' && defineProperty) {
	    defineProperty(object, key, {
	      'configurable': true,
	      'enumerable': true,
	      'value': value,
	      'writable': true
	    });
	  } else {
	    object[key] = value;
	  }
	}

	/**
	 * This function is like `assignValue` except that it doesn't assign
	 * `undefined` values.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */

	function assignMergeValue(object, key, value) {
	  if (value !== undefined && !eq(object[key], value) || value === undefined && !(key in object)) {
	    baseAssignValue(object, key, value);
	  }
	}

	/**
	 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function (object, iteratee, keysFunc) {
	    var index = -1,
	        iterable = Object(object),
	        props = keysFunc(object),
	        length = props.length;

	    while (length--) {
	      var key = props[fromRight ? length : ++index];

	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }

	    return object;
	  };
	}

	/**
	 * The base implementation of `baseForOwn` which iterates over `object`
	 * properties returned by `keysFunc` and invokes `iteratee` for each property.
	 * Iteratee functions may exit iteration early by explicitly returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */

	var baseFor = createBaseFor();

	/** Detect free variable `exports`. */

	var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
	/** Detect free variable `module`. */

	var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
	/** Detect the popular CommonJS extension `module.exports`. */

	var moduleExports = freeModule && freeModule.exports === freeExports;
	/** Built-in value references. */

	var Buffer = moduleExports ? root.Buffer : undefined,
	    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;
	/**
	 * Creates a clone of  `buffer`.
	 *
	 * @private
	 * @param {Buffer} buffer The buffer to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Buffer} Returns the cloned buffer.
	 */

	function cloneBuffer(buffer, isDeep) {
	  if (isDeep) {
	    return buffer.slice();
	  }

	  var length = buffer.length,
	      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
	  buffer.copy(result);
	  return result;
	}

	/** Built-in value references. */

	var Uint8Array = root.Uint8Array;

	/**
	 * Creates a clone of `arrayBuffer`.
	 *
	 * @private
	 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
	 * @returns {ArrayBuffer} Returns the cloned array buffer.
	 */

	function cloneArrayBuffer(arrayBuffer) {
	  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
	  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
	  return result;
	}

	/**
	 * Creates a clone of `typedArray`.
	 *
	 * @private
	 * @param {Object} typedArray The typed array to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned typed array.
	 */

	function cloneTypedArray(typedArray, isDeep) {
	  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
	  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
	}

	/**
	 * Copies the values of `source` to `array`.
	 *
	 * @private
	 * @param {Array} source The array to copy values from.
	 * @param {Array} [array=[]] The array to copy values to.
	 * @returns {Array} Returns `array`.
	 */
	function copyArray(source, array) {
	  var index = -1,
	      length = source.length;
	  array || (array = Array(length));

	  while (++index < length) {
	    array[index] = source[index];
	  }

	  return array;
	}

	/** Built-in value references. */

	var objectCreate = Object.create;
	/**
	 * The base implementation of `_.create` without support for assigning
	 * properties to the created object.
	 *
	 * @private
	 * @param {Object} proto The object to inherit from.
	 * @returns {Object} Returns the new object.
	 */

	var baseCreate = function () {
	  function object() {}

	  return function (proto) {
	    if (!isObject(proto)) {
	      return {};
	    }

	    if (objectCreate) {
	      return objectCreate(proto);
	    }

	    object.prototype = proto;
	    var result = new object();
	    object.prototype = undefined;
	    return result;
	  };
	}();

	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg(func, transform) {
	  return function (arg) {
	    return func(transform(arg));
	  };
	}

	/** Built-in value references. */

	var getPrototype = overArg(Object.getPrototypeOf, Object);

	/** Used for built-in method references. */
	var objectProto$5 = Object.prototype;
	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */

	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = typeof Ctor == 'function' && Ctor.prototype || objectProto$5;
	  return value === proto;
	}

	/**
	 * Initializes an object clone.
	 *
	 * @private
	 * @param {Object} object The object to clone.
	 * @returns {Object} Returns the initialized clone.
	 */

	function initCloneObject(object) {
	  return typeof object.constructor == 'function' && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return value != null && typeof value == 'object';
	}

	/** `Object#toString` result references. */

	var argsTag = '[object Arguments]';
	/**
	 * The base implementation of `_.isArguments`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 */

	function baseIsArguments(value) {
	  return isObjectLike(value) && baseGetTag(value) == argsTag;
	}

	/** Used for built-in method references. */

	var objectProto$6 = Object.prototype;
	/** Used to check objects for own properties. */

	var hasOwnProperty$4 = objectProto$6.hasOwnProperty;
	/** Built-in value references. */

	var propertyIsEnumerable = objectProto$6.propertyIsEnumerable;
	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */

	var isArguments = baseIsArguments(function () {
	  return arguments;
	}()) ? baseIsArguments : function (value) {
	  return isObjectLike(value) && hasOwnProperty$4.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
	};

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;
	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */

	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */

	function isArrayLike(value) {
	  return value != null && isLength(value.length) && !isFunction(value);
	}

	/**
	 * This method is like `_.isArrayLike` except that it also checks if `value`
	 * is an object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array-like object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArrayLikeObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLikeObject(document.body.children);
	 * // => true
	 *
	 * _.isArrayLikeObject('abc');
	 * // => false
	 *
	 * _.isArrayLikeObject(_.noop);
	 * // => false
	 */

	function isArrayLikeObject(value) {
	  return isObjectLike(value) && isArrayLike(value);
	}

	/**
	 * This method returns `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {boolean} Returns `false`.
	 * @example
	 *
	 * _.times(2, _.stubFalse);
	 * // => [false, false]
	 */
	function stubFalse() {
	  return false;
	}

	/** Detect free variable `exports`. */

	var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;
	/** Detect free variable `module`. */

	var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;
	/** Detect the popular CommonJS extension `module.exports`. */

	var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;
	/** Built-in value references. */

	var Buffer$1 = moduleExports$1 ? root.Buffer : undefined;
	/* Built-in method references for those with the same name as other `lodash` methods. */

	var nativeIsBuffer = Buffer$1 ? Buffer$1.isBuffer : undefined;
	/**
	 * Checks if `value` is a buffer.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.3.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
	 * @example
	 *
	 * _.isBuffer(new Buffer(2));
	 * // => true
	 *
	 * _.isBuffer(new Uint8Array(2));
	 * // => false
	 */

	var isBuffer = nativeIsBuffer || stubFalse;

	/** `Object#toString` result references. */

	var objectTag = '[object Object]';
	/** Used for built-in method references. */

	var funcProto$2 = Function.prototype,
	    objectProto$7 = Object.prototype;
	/** Used to resolve the decompiled source of functions. */

	var funcToString$2 = funcProto$2.toString;
	/** Used to check objects for own properties. */

	var hasOwnProperty$5 = objectProto$7.hasOwnProperty;
	/** Used to infer the `Object` constructor. */

	var objectCtorString = funcToString$2.call(Object);
	/**
	 * Checks if `value` is a plain object, that is, an object created by the
	 * `Object` constructor or one with a `[[Prototype]]` of `null`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.8.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * _.isPlainObject(new Foo);
	 * // => false
	 *
	 * _.isPlainObject([1, 2, 3]);
	 * // => false
	 *
	 * _.isPlainObject({ 'x': 0, 'y': 0 });
	 * // => true
	 *
	 * _.isPlainObject(Object.create(null));
	 * // => true
	 */

	function isPlainObject(value) {
	  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
	    return false;
	  }

	  var proto = getPrototype(value);

	  if (proto === null) {
	    return true;
	  }

	  var Ctor = hasOwnProperty$5.call(proto, 'constructor') && proto.constructor;
	  return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString$2.call(Ctor) == objectCtorString;
	}

	/** `Object#toString` result references. */

	var argsTag$1 = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag$1 = '[object Function]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag$1 = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    weakMapTag = '[object WeakMap]';
	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';
	/** Used to identify `toStringTag` values of typed arrays. */

	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag$1] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag$1] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
	/**
	 * The base implementation of `_.isTypedArray` without Node.js optimizations.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 */

	function baseIsTypedArray(value) {
	  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
	}

	/**
	 * The base implementation of `_.unary` without support for storing metadata.
	 *
	 * @private
	 * @param {Function} func The function to cap arguments for.
	 * @returns {Function} Returns the new capped function.
	 */
	function baseUnary(func) {
	  return function (value) {
	    return func(value);
	  };
	}

	/** Detect free variable `exports`. */

	var freeExports$2 = typeof exports == 'object' && exports && !exports.nodeType && exports;
	/** Detect free variable `module`. */

	var freeModule$2 = freeExports$2 && typeof module == 'object' && module && !module.nodeType && module;
	/** Detect the popular CommonJS extension `module.exports`. */

	var moduleExports$2 = freeModule$2 && freeModule$2.exports === freeExports$2;
	/** Detect free variable `process` from Node.js. */

	var freeProcess = moduleExports$2 && freeGlobal.process;
	/** Used to access faster Node.js helpers. */

	var nodeUtil = function () {
	  try {
	    // Use `util.types` for Node.js 10+.
	    var types = freeModule$2 && freeModule$2.require && freeModule$2.require('util').types;

	    if (types) {
	      return types;
	    } // Legacy `process.binding('util')` for Node.js < 10.


	    return freeProcess && freeProcess.binding && freeProcess.binding('util');
	  } catch (e) {}
	}();

	/* Node.js helper references. */

	var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */

	var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

	/**
	 * Gets the value at `key`, unless `key` is "__proto__".
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function safeGet(object, key) {
	  if (key == '__proto__') {
	    return;
	  }

	  return object[key];
	}

	/** Used for built-in method references. */

	var objectProto$8 = Object.prototype;
	/** Used to check objects for own properties. */

	var hasOwnProperty$6 = objectProto$8.hasOwnProperty;
	/**
	 * Assigns `value` to `key` of `object` if the existing value is not equivalent
	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */

	function assignValue(object, key, value) {
	  var objValue = object[key];

	  if (!(hasOwnProperty$6.call(object, key) && eq(objValue, value)) || value === undefined && !(key in object)) {
	    baseAssignValue(object, key, value);
	  }
	}

	/**
	 * Copies properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy properties from.
	 * @param {Array} props The property identifiers to copy.
	 * @param {Object} [object={}] The object to copy properties to.
	 * @param {Function} [customizer] The function to customize copied values.
	 * @returns {Object} Returns `object`.
	 */

	function copyObject(source, props, object, customizer) {
	  var isNew = !object;
	  object || (object = {});
	  var index = -1,
	      length = props.length;

	  while (++index < length) {
	    var key = props[index];
	    var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;

	    if (newValue === undefined) {
	      newValue = source[key];
	    }

	    if (isNew) {
	      baseAssignValue(object, key, newValue);
	    } else {
	      assignValue(object, key, newValue);
	    }
	  }

	  return object;
	}

	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */
	function baseTimes(n, iteratee) {
	  var index = -1,
	      result = Array(n);

	  while (++index < n) {
	    result[index] = iteratee(index);
	  }

	  return result;
	}

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER$1 = 9007199254740991;
	/** Used to detect unsigned integer values. */

	var reIsUint = /^(?:0|[1-9]\d*)$/;
	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */

	function isIndex(value, length) {
	  var type = typeof value;
	  length = length == null ? MAX_SAFE_INTEGER$1 : length;
	  return !!length && (type == 'number' || type != 'symbol' && reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
	}

	/** Used for built-in method references. */

	var objectProto$9 = Object.prototype;
	/** Used to check objects for own properties. */

	var hasOwnProperty$7 = objectProto$9.hasOwnProperty;
	/**
	 * Creates an array of the enumerable property names of the array-like `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @param {boolean} inherited Specify returning inherited property names.
	 * @returns {Array} Returns the array of property names.
	 */

	function arrayLikeKeys(value, inherited) {
	  var isArr = isArray(value),
	      isArg = !isArr && isArguments(value),
	      isBuff = !isArr && !isArg && isBuffer(value),
	      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
	      skipIndexes = isArr || isArg || isBuff || isType,
	      result = skipIndexes ? baseTimes(value.length, String) : [],
	      length = result.length;

	  for (var key in value) {
	    if ((inherited || hasOwnProperty$7.call(value, key)) && !(skipIndexes && ( // Safari 9 has enumerable `arguments.length` in strict mode.
	    key == 'length' || // Node.js 0.10 has enumerable non-index properties on buffers.
	    isBuff && (key == 'offset' || key == 'parent') || // PhantomJS 2 has enumerable non-index properties on typed arrays.
	    isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') || // Skip index properties.
	    isIndex(key, length)))) {
	      result.push(key);
	    }
	  }

	  return result;
	}

	/**
	 * This function is like
	 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * except that it includes inherited enumerable properties.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function nativeKeysIn(object) {
	  var result = [];

	  if (object != null) {
	    for (var key in Object(object)) {
	      result.push(key);
	    }
	  }

	  return result;
	}

	/** Used for built-in method references. */

	var objectProto$a = Object.prototype;
	/** Used to check objects for own properties. */

	var hasOwnProperty$8 = objectProto$a.hasOwnProperty;
	/**
	 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */

	function baseKeysIn(object) {
	  if (!isObject(object)) {
	    return nativeKeysIn(object);
	  }

	  var isProto = isPrototype(object),
	      result = [];

	  for (var key in object) {
	    if (!(key == 'constructor' && (isProto || !hasOwnProperty$8.call(object, key)))) {
	      result.push(key);
	    }
	  }

	  return result;
	}

	/**
	 * Creates an array of the own and inherited enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keysIn(new Foo);
	 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	 */

	function keysIn(object) {
	  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
	}

	/**
	 * Converts `value` to a plain object flattening inherited enumerable string
	 * keyed properties of `value` to own properties of the plain object.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {Object} Returns the converted plain object.
	 * @example
	 *
	 * function Foo() {
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.assign({ 'a': 1 }, new Foo);
	 * // => { 'a': 1, 'b': 2 }
	 *
	 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
	 * // => { 'a': 1, 'b': 2, 'c': 3 }
	 */

	function toPlainObject(value) {
	  return copyObject(value, keysIn(value));
	}

	/**
	 * A specialized version of `baseMerge` for arrays and objects which performs
	 * deep merges and tracks traversed objects enabling objects with circular
	 * references to be merged.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @param {string} key The key of the value to merge.
	 * @param {number} srcIndex The index of `source`.
	 * @param {Function} mergeFunc The function to merge values.
	 * @param {Function} [customizer] The function to customize assigned values.
	 * @param {Object} [stack] Tracks traversed source values and their merged
	 *  counterparts.
	 */

	function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
	  var objValue = safeGet(object, key),
	      srcValue = safeGet(source, key),
	      stacked = stack.get(srcValue);

	  if (stacked) {
	    assignMergeValue(object, key, stacked);
	    return;
	  }

	  var newValue = customizer ? customizer(objValue, srcValue, key + '', object, source, stack) : undefined;
	  var isCommon = newValue === undefined;

	  if (isCommon) {
	    var isArr = isArray(srcValue),
	        isBuff = !isArr && isBuffer(srcValue),
	        isTyped = !isArr && !isBuff && isTypedArray(srcValue);
	    newValue = srcValue;

	    if (isArr || isBuff || isTyped) {
	      if (isArray(objValue)) {
	        newValue = objValue;
	      } else if (isArrayLikeObject(objValue)) {
	        newValue = copyArray(objValue);
	      } else if (isBuff) {
	        isCommon = false;
	        newValue = cloneBuffer(srcValue, true);
	      } else if (isTyped) {
	        isCommon = false;
	        newValue = cloneTypedArray(srcValue, true);
	      } else {
	        newValue = [];
	      }
	    } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
	      newValue = objValue;

	      if (isArguments(objValue)) {
	        newValue = toPlainObject(objValue);
	      } else if (!isObject(objValue) || isFunction(objValue)) {
	        newValue = initCloneObject(srcValue);
	      }
	    } else {
	      isCommon = false;
	    }
	  }

	  if (isCommon) {
	    // Recursively merge objects and arrays (susceptible to call stack limits).
	    stack.set(srcValue, newValue);
	    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
	    stack['delete'](srcValue);
	  }

	  assignMergeValue(object, key, newValue);
	}

	/**
	 * The base implementation of `_.merge` without support for multiple sources.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @param {number} srcIndex The index of `source`.
	 * @param {Function} [customizer] The function to customize merged values.
	 * @param {Object} [stack] Tracks traversed source values and their merged
	 *  counterparts.
	 */

	function baseMerge(object, source, srcIndex, customizer, stack) {
	  if (object === source) {
	    return;
	  }

	  baseFor(source, function (srcValue, key) {
	    if (isObject(srcValue)) {
	      stack || (stack = new Stack());
	      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
	    } else {
	      var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + '', object, source, stack) : undefined;

	      if (newValue === undefined) {
	        newValue = srcValue;
	      }

	      assignMergeValue(object, key, newValue);
	    }
	  }, keysIn);
	}

	/**
	 * Used by `_.defaultsDeep` to customize its `_.merge` use to merge source
	 * objects into destination objects that are passed thru.
	 *
	 * @private
	 * @param {*} objValue The destination value.
	 * @param {*} srcValue The source value.
	 * @param {string} key The key of the property to merge.
	 * @param {Object} object The parent object of `objValue`.
	 * @param {Object} source The parent object of `srcValue`.
	 * @param {Object} [stack] Tracks traversed source values and their merged
	 *  counterparts.
	 * @returns {*} Returns the value to assign.
	 */

	function customDefaultsMerge(objValue, srcValue, key, object, source, stack) {
	  if (isObject(objValue) && isObject(srcValue)) {
	    // Recursively merge objects and arrays (susceptible to call stack limits).
	    stack.set(srcValue, objValue);
	    baseMerge(objValue, srcValue, undefined, customDefaultsMerge, stack);
	    stack['delete'](srcValue);
	  }

	  return objValue;
	}

	/**
	 * Checks if the given arguments are from an iteratee call.
	 *
	 * @private
	 * @param {*} value The potential iteratee value argument.
	 * @param {*} index The potential iteratee index or key argument.
	 * @param {*} object The potential iteratee object argument.
	 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
	 *  else `false`.
	 */

	function isIterateeCall(value, index, object) {
	  if (!isObject(object)) {
	    return false;
	  }

	  var type = typeof index;

	  if (type == 'number' ? isArrayLike(object) && isIndex(index, object.length) : type == 'string' && index in object) {
	    return eq(object[index], value);
	  }

	  return false;
	}

	/**
	 * Creates a function like `_.assign`.
	 *
	 * @private
	 * @param {Function} assigner The function to assign values.
	 * @returns {Function} Returns the new assigner function.
	 */

	function createAssigner(assigner) {
	  return baseRest(function (object, sources) {
	    var index = -1,
	        length = sources.length,
	        customizer = length > 1 ? sources[length - 1] : undefined,
	        guard = length > 2 ? sources[2] : undefined;
	    customizer = assigner.length > 3 && typeof customizer == 'function' ? (length--, customizer) : undefined;

	    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
	      customizer = length < 3 ? undefined : customizer;
	      length = 1;
	    }

	    object = Object(object);

	    while (++index < length) {
	      var source = sources[index];

	      if (source) {
	        assigner(object, source, index, customizer);
	      }
	    }

	    return object;
	  });
	}

	/**
	 * This method is like `_.merge` except that it accepts `customizer` which
	 * is invoked to produce the merged values of the destination and source
	 * properties. If `customizer` returns `undefined`, merging is handled by the
	 * method instead. The `customizer` is invoked with six arguments:
	 * (objValue, srcValue, key, object, source, stack).
	 *
	 * **Note:** This method mutates `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} sources The source objects.
	 * @param {Function} customizer The function to customize assigned values.
	 * @returns {Object} Returns `object`.
	 * @example
	 *
	 * function customizer(objValue, srcValue) {
	 *   if (_.isArray(objValue)) {
	 *     return objValue.concat(srcValue);
	 *   }
	 * }
	 *
	 * var object = { 'a': [1], 'b': [2] };
	 * var other = { 'a': [3], 'b': [4] };
	 *
	 * _.mergeWith(object, other, customizer);
	 * // => { 'a': [1, 3], 'b': [2, 4] }
	 */

	var mergeWith = createAssigner(function (object, source, srcIndex, customizer) {
	  baseMerge(object, source, srcIndex, customizer);
	});

	/**
	 * This method is like `_.defaults` except that it recursively assigns
	 * default properties.
	 *
	 * **Note:** This method mutates `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.10.0
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} [sources] The source objects.
	 * @returns {Object} Returns `object`.
	 * @see _.defaults
	 * @example
	 *
	 * _.defaultsDeep({ 'a': { 'b': 2 } }, { 'a': { 'b': 1, 'c': 3 } });
	 * // => { 'a': { 'b': 2, 'c': 3 } }
	 */

	var defaultsDeep = baseRest(function (args) {
	  args.push(undefined, customDefaultsMerge);
	  return apply(mergeWith, undefined, args);
	});

	var App =
	/*#__PURE__*/
	function () {
	  function App() {
	    var _this = this;

	    var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    _classCallCheck(this, App);

	    this.options = defaultsDeep(settings, DefaultSettings);

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

	  _createClass(App, [{
	    key: "resize",
	    value: function resize() {
	      var width = this.getWorldWidth();
	      var height = this.getWorldHeight();
	      this.world.resize(width, height);
	      this.renderer.setSize(width, height);
	      this.renderer.setPixelRatio(this.options.renderer.pixelRatio);
	    }
	  }, {
	    key: "update",
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
	    key: "setCommonCSS",
	    value: function setCommonCSS() {
	      document.write("<style>*{margin:0;padding:0} body{overflow:hidden}</style>");
	    }
	  }, {
	    key: "getWorldWidth",
	    value: function getWorldWidth() {
	      return this.parent === document.body ? window.innerWidth : this.parent.offsetWidth;
	    }
	  }, {
	    key: "getWorldHeight",
	    value: function getWorldHeight() {
	      return this.parent === document.body ? window.innerHeight : this.parent.offsetHeight;
	    }
	  }, {
	    key: "start",
	    value: function start() {
	      if (this.state === APP_STOP) {
	        this.state = APP_RUNNING;
	        this.parent.appendChild(this.renderer.domElement);
	        this.resize();
	        this.update();
	      }
	    }
	  }, {
	    key: "resume",
	    value: function resume() {
	      if (this.state === APP_PAUSE) {
	        this.state = APP_RUNNING;
	      }
	    }
	  }, {
	    key: "pause",
	    value: function pause() {
	      if (this.state === APP_RUNNING) {
	        this.state = APP_PAUSE;
	      }
	    }
	  }, {
	    key: "destroy",
	    value: function destroy() {
	      this.world.destroy();
	    }
	  }, {
	    key: "openFullScreen",
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
	    key: "closeFullScreen",
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
	    key: "toggleFullScreen",
	    value: function toggleFullScreen() {
	      if (this.isFullScreen) {
	        this.closeFullScreen();
	      } else {
	        this.openFullScreen();
	      }
	    }
	  }, {
	    key: "screenshot",
	    value: function screenshot() {
	      var img = new Image();
	      this.renderer.render(this.world.scene, this.world.camera);
	      img.src = this.renderer.domElement.toDataURL();
	      var w = window.open('', '');
	      w.document.title = "Nova Screenshot";
	      w.document.body.appendChild(img);
	    }
	  }, {
	    key: "sceneCoordinateToCanvasCoordinate",
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

	var Bind = function Bind(_obj) {
	  var _this = this;

	  _classCallCheck(this, Bind);

	  this.add = function (obj) {
	    var funcs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    _this.bindMap.set(obj, funcs);
	  };

	  this.remove = function (obj) {
	    _this.bindMap.delete(obj);
	  };

	  this.defineReactive = function (data, key, val) {
	    Object.defineProperty(data, key, {
	      enumerable: true,
	      configurable: false,
	      get: function get() {
	        return val;
	      },
	      set: function set(newVal) {
	        val = newVal;
	        var bindMap = data.bindMap;
	        var _iteratorNormalCompletion = true;
	        var _didIteratorError = false;
	        var _iteratorError = undefined;

	        try {
	          for (var _iterator = bindMap[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	            var _step$value = _slicedToArray(_step.value, 2),
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
	            if (!_iteratorNormalCompletion && _iterator.return != null) {
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
	  };

	  for (var i in _obj) {
	    this[i] = _obj[i];
	    this.bindMap = new Map();
	    this.defineReactive(this, i, this[i]);
	  }
	};

	var FBOWorld = function FBOWorld(app, camera, width, height) {
	  var _this = this;

	  _classCallCheck(this, FBOWorld);

	  this.update = function (time) {
	    _this.logicLoop.update(time);

	    _this.renderLoop.update(time);
	  };

	  this.resize = function () {
	    if (_this.camera.type === 'PerspectiveCamera') {
	      _this.camera.aspect = _this.width / _this.height;

	      _this.camera.updateProjectionMatrix();
	    } else {
	      _this.camera.left = -_this.width / 2;
	      _this.camera.right = _this.width / 2;
	      _this.camera.top = _this.height / 2;
	      _this.camera.bottom = -_this.height / 2;

	      _this.camera.updateProjectionMatrix();
	    }
	  };

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
	};

	var Monitor =
	/*#__PURE__*/
	function () {
	  function Monitor(world, option) {
	    _classCallCheck(this, Monitor);

	    this.option = option;
	    this.fullWidth = world.app.getWorldWidth();
	    this.fullHeight = world.app.getWorldHeight();
	    this.renderer = new three.WebGLRenderer();
	    this.world = world;
	    this.canvas = this.renderer.domElement;
	    this.renderer.setSize(this.fullWidth * option.width, this.fullHeight * option.height);
	    this.renderer.setPixelRatio(window.devicePixelRatio);
	  }

	  _createClass(Monitor, [{
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

	var QR8bitByte =
	/*#__PURE__*/
	function () {
	  function QR8bitByte(data) {
	    _classCallCheck(this, QR8bitByte);

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

	  _createClass(QR8bitByte, [{
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

	var QRCodeModel =
	/*#__PURE__*/
	function () {
	  function QRCodeModel(typeNumber, errorCorrectLevel) {
	    _classCallCheck(this, QRCodeModel);

	    this.typeNumber = typeNumber;
	    this.errorCorrectLevel = errorCorrectLevel;
	    this.modules = undefined;
	    this.moduleCount = 0;
	    this.dataCache = undefined;
	    this.dataList = [];
	  }

	  _createClass(QRCodeModel, [{
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
	  get: function get(index) {
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
	  get: function get(index) {
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

	var Transitioner =
	/*#__PURE__*/
	function () {
	  function Transitioner(app, world, texture) {
	    var _this = this;

	    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

	    _classCallCheck(this, Transitioner);

	    this.update = function () {
	      var value = Math.min(_this.options.transition, 1);
	      value = Math.max(value, 0);
	      _this.material.uniforms.mixRatio.value = value;

	      _this.app.renderer.setClearColor(_this.sceneB.clearColor || 0);

	      _this.sceneB.update();

	      _this.app.renderer.render(_this.sceneB.scene, _this.sceneB.camera, _this.sceneB.fbo, true);

	      _this.app.renderer.setClearColor(_this.sceneA.clearColor || 0);

	      _this.sceneA.update();

	      _this.app.renderer.render(_this.sceneA.scene, _this.sceneA.camera, _this.sceneA.fbo, true);

	      _this.app.renderer.render(_this.world.scene, _this.world.camera, null, true);
	    };

	    this.options = _objectSpread({
	      useTexture: true,
	      transition: 0,
	      speed: 10,
	      texture: 5,
	      loopTexture: true,
	      isAnimate: true,
	      threshold: 0.3
	    }, options);
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

	  _createClass(Transitioner, [{
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
	  }]);

	  return Transitioner;
	}();

	var View =
	/*#__PURE__*/
	function () {
	  function View(world, camera, _ref) {
	    var _this = this;

	    var _ref$clearColor = _ref.clearColor,
	        clearColor = _ref$clearColor === void 0 ? 0x000000 : _ref$clearColor,
	        _ref$top = _ref.top,
	        _top = _ref$top === void 0 ? 0 : _ref$top,
	        _ref$left = _ref.left,
	        _left = _ref$left === void 0 ? 0 : _ref$left,
	        _ref$width = _ref.width,
	        _width = _ref$width === void 0 ? 1 : _ref$width,
	        _ref$height = _ref.height,
	        _height = _ref$height === void 0 ? 1 : _ref$height;

	    _classCallCheck(this, View);

	    this.render = function () {
	      var left = Math.floor(_this.worldWidth * _this.left);
	      var top = Math.floor(_this.worldHeight * _this.top);
	      var width = Math.floor(_this.worldWidth * _this.width);
	      var height = Math.floor(_this.worldHeight * _this.height);

	      _this.renderer.setViewport(left, top, width, height);

	      _this.renderer.setScissor(left, top, width, height);

	      _this.renderer.setScissorTest(true);

	      _this.renderer.setClearColor(_this.clearColor);

	      _this.renderer.render(_this.scene, _this.camera);
	    };

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
	    this.left = _left;
	    this.top = _top;
	    this.width = _width;
	    this.height = _height;
	    this.fbo = new three.WebGLRenderTarget(this.worldWidth * this.width, this.worldHeight * this.height, this.renderTargetParameters);
	    this.resize();
	  }

	  _createClass(View, [{
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
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear$1() {
	  this.__data__ = [];
	  this.size = 0;
	}

	var _listCacheClear = listCacheClear$1;

	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq$1(value, other) {
	  return value === other || value !== value && other !== other;
	}

	var eq_1 = eq$1;

	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */

	function assocIndexOf$1(array, key) {
	  var length = array.length;

	  while (length--) {
	    if (eq_1(array[length][0], key)) {
	      return length;
	    }
	  }

	  return -1;
	}

	var _assocIndexOf = assocIndexOf$1;

	/** Used for built-in method references. */

	var arrayProto$1 = Array.prototype;
	/** Built-in value references. */

	var splice$1 = arrayProto$1.splice;
	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */

	function listCacheDelete$1(key) {
	  var data = this.__data__,
	      index = _assocIndexOf(data, key);

	  if (index < 0) {
	    return false;
	  }

	  var lastIndex = data.length - 1;

	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice$1.call(data, index, 1);
	  }

	  --this.size;
	  return true;
	}

	var _listCacheDelete = listCacheDelete$1;

	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */

	function listCacheGet$1(key) {
	  var data = this.__data__,
	      index = _assocIndexOf(data, key);
	  return index < 0 ? undefined : data[index][1];
	}

	var _listCacheGet = listCacheGet$1;

	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */

	function listCacheHas$1(key) {
	  return _assocIndexOf(this.__data__, key) > -1;
	}

	var _listCacheHas = listCacheHas$1;

	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */

	function listCacheSet$1(key, value) {
	  var data = this.__data__,
	      index = _assocIndexOf(data, key);

	  if (index < 0) {
	    ++this.size;
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }

	  return this;
	}

	var _listCacheSet = listCacheSet$1;

	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */

	function ListCache$1(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;
	  this.clear();

	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	} // Add methods to `ListCache`.


	ListCache$1.prototype.clear = _listCacheClear;
	ListCache$1.prototype['delete'] = _listCacheDelete;
	ListCache$1.prototype.get = _listCacheGet;
	ListCache$1.prototype.has = _listCacheHas;
	ListCache$1.prototype.set = _listCacheSet;
	var _ListCache = ListCache$1;

	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */

	function stackClear$1() {
	  this.__data__ = new _ListCache();
	  this.size = 0;
	}

	var _stackClear = stackClear$1;

	/**
	 * Removes `key` and its value from the stack.
	 *
	 * @private
	 * @name delete
	 * @memberOf Stack
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function stackDelete$1(key) {
	  var data = this.__data__,
	      result = data['delete'](key);
	  this.size = data.size;
	  return result;
	}

	var _stackDelete = stackDelete$1;

	/**
	 * Gets the stack value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Stack
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function stackGet$1(key) {
	  return this.__data__.get(key);
	}

	var _stackGet = stackGet$1;

	/**
	 * Checks if a stack value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Stack
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function stackHas$1(key) {
	  return this.__data__.has(key);
	}

	var _stackHas = stackHas$1;

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	/** Detect free variable `global` from Node.js. */

	var freeGlobal$1 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
	var _freeGlobal = freeGlobal$1;

	/** Detect free variable `self`. */

	var freeSelf$1 = typeof self == 'object' && self && self.Object === Object && self;
	/** Used as a reference to the global object. */

	var root$1 = _freeGlobal || freeSelf$1 || Function('return this')();
	var _root = root$1;

	/** Built-in value references. */

	var Symbol$2 = _root.Symbol;
	var _Symbol = Symbol$2;

	/** Used for built-in method references. */

	var objectProto$b = Object.prototype;
	/** Used to check objects for own properties. */

	var hasOwnProperty$9 = objectProto$b.hasOwnProperty;
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */

	var nativeObjectToString$2 = objectProto$b.toString;
	/** Built-in value references. */

	var symToStringTag$2 = _Symbol ? _Symbol.toStringTag : undefined;
	/**
	 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the raw `toStringTag`.
	 */

	function getRawTag$1(value) {
	  var isOwn = hasOwnProperty$9.call(value, symToStringTag$2),
	      tag = value[symToStringTag$2];

	  try {
	    value[symToStringTag$2] = undefined;
	  } catch (e) {}

	  var result = nativeObjectToString$2.call(value);

	  {
	    if (isOwn) {
	      value[symToStringTag$2] = tag;
	    } else {
	      delete value[symToStringTag$2];
	    }
	  }

	  return result;
	}

	var _getRawTag = getRawTag$1;

	/** Used for built-in method references. */
	var objectProto$c = Object.prototype;
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */

	var nativeObjectToString$3 = objectProto$c.toString;
	/**
	 * Converts `value` to a string using `Object.prototype.toString`.
	 *
	 * @private
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 */

	function objectToString$1(value) {
	  return nativeObjectToString$3.call(value);
	}

	var _objectToString = objectToString$1;

	/** `Object#toString` result references. */

	var nullTag$1 = '[object Null]',
	    undefinedTag$1 = '[object Undefined]';
	/** Built-in value references. */

	var symToStringTag$3 = _Symbol ? _Symbol.toStringTag : undefined;
	/**
	 * The base implementation of `getTag` without fallbacks for buggy environments.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */

	function baseGetTag$1(value) {
	  if (value == null) {
	    return value === undefined ? undefinedTag$1 : nullTag$1;
	  }

	  return symToStringTag$3 && symToStringTag$3 in Object(value) ? _getRawTag(value) : _objectToString(value);
	}

	var _baseGetTag = baseGetTag$1;

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject$1(value) {
	  var type = typeof value;
	  return value != null && (type == 'object' || type == 'function');
	}

	var isObject_1 = isObject$1;

	/** `Object#toString` result references. */

	var asyncTag$1 = '[object AsyncFunction]',
	    funcTag$2 = '[object Function]',
	    genTag$1 = '[object GeneratorFunction]',
	    proxyTag$1 = '[object Proxy]';
	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */

	function isFunction$1(value) {
	  if (!isObject_1(value)) {
	    return false;
	  } // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 9 which returns 'object' for typed arrays and other constructors.


	  var tag = _baseGetTag(value);
	  return tag == funcTag$2 || tag == genTag$1 || tag == asyncTag$1 || tag == proxyTag$1;
	}

	var isFunction_1 = isFunction$1;

	/** Used to detect overreaching core-js shims. */

	var coreJsData$1 = _root['__core-js_shared__'];
	var _coreJsData = coreJsData$1;

	/** Used to detect methods masquerading as native. */

	var maskSrcKey$1 = function () {
	  var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
	  return uid ? 'Symbol(src)_1.' + uid : '';
	}();
	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */


	function isMasked$1(func) {
	  return !!maskSrcKey$1 && maskSrcKey$1 in func;
	}

	var _isMasked = isMasked$1;

	/** Used for built-in method references. */
	var funcProto$3 = Function.prototype;
	/** Used to resolve the decompiled source of functions. */

	var funcToString$3 = funcProto$3.toString;
	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to convert.
	 * @returns {string} Returns the source code.
	 */

	function toSource$1(func) {
	  if (func != null) {
	    try {
	      return funcToString$3.call(func);
	    } catch (e) {}

	    try {
	      return func + '';
	    } catch (e) {}
	  }

	  return '';
	}

	var _toSource = toSource$1;

	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */

	var reRegExpChar$1 = /[\\^$.*+?()[\]{}|]/g;
	/** Used to detect host constructors (Safari). */

	var reIsHostCtor$1 = /^\[object .+?Constructor\]$/;
	/** Used for built-in method references. */

	var funcProto$4 = Function.prototype,
	    objectProto$d = Object.prototype;
	/** Used to resolve the decompiled source of functions. */

	var funcToString$4 = funcProto$4.toString;
	/** Used to check objects for own properties. */

	var hasOwnProperty$a = objectProto$d.hasOwnProperty;
	/** Used to detect if a method is native. */

	var reIsNative$1 = RegExp('^' + funcToString$4.call(hasOwnProperty$a).replace(reRegExpChar$1, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
	/**
	 * The base implementation of `_.isNative` without bad shim checks.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 */

	function baseIsNative$1(value) {
	  if (!isObject_1(value) || _isMasked(value)) {
	    return false;
	  }

	  var pattern = isFunction_1(value) ? reIsNative$1 : reIsHostCtor$1;
	  return pattern.test(_toSource(value));
	}

	var _baseIsNative = baseIsNative$1;

	/**
	 * Gets the value at `key` of `object`.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function getValue$1(object, key) {
	  return object == null ? undefined : object[key];
	}

	var _getValue = getValue$1;

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */

	function getNative$1(object, key) {
	  var value = _getValue(object, key);
	  return _baseIsNative(value) ? value : undefined;
	}

	var _getNative = getNative$1;

	/* Built-in method references that are verified to be native. */

	var Map$2 = _getNative(_root, 'Map');
	var _Map = Map$2;

	/* Built-in method references that are verified to be native. */

	var nativeCreate$1 = _getNative(Object, 'create');
	var _nativeCreate = nativeCreate$1;

	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */

	function hashClear$1() {
	  this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
	  this.size = 0;
	}

	var _hashClear = hashClear$1;

	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function hashDelete$1(key) {
	  var result = this.has(key) && delete this.__data__[key];
	  this.size -= result ? 1 : 0;
	  return result;
	}

	var _hashDelete = hashDelete$1;

	/** Used to stand-in for `undefined` hash values. */

	var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';
	/** Used for built-in method references. */

	var objectProto$e = Object.prototype;
	/** Used to check objects for own properties. */

	var hasOwnProperty$b = objectProto$e.hasOwnProperty;
	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */

	function hashGet$1(key) {
	  var data = this.__data__;

	  if (_nativeCreate) {
	    var result = data[key];
	    return result === HASH_UNDEFINED$2 ? undefined : result;
	  }

	  return hasOwnProperty$b.call(data, key) ? data[key] : undefined;
	}

	var _hashGet = hashGet$1;

	/** Used for built-in method references. */

	var objectProto$f = Object.prototype;
	/** Used to check objects for own properties. */

	var hasOwnProperty$c = objectProto$f.hasOwnProperty;
	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */

	function hashHas$1(key) {
	  var data = this.__data__;
	  return _nativeCreate ? data[key] !== undefined : hasOwnProperty$c.call(data, key);
	}

	var _hashHas = hashHas$1;

	/** Used to stand-in for `undefined` hash values. */

	var HASH_UNDEFINED$3 = '__lodash_hash_undefined__';
	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */

	function hashSet$1(key, value) {
	  var data = this.__data__;
	  this.size += this.has(key) ? 0 : 1;
	  data[key] = _nativeCreate && value === undefined ? HASH_UNDEFINED$3 : value;
	  return this;
	}

	var _hashSet = hashSet$1;

	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */

	function Hash$1(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;
	  this.clear();

	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	} // Add methods to `Hash`.


	Hash$1.prototype.clear = _hashClear;
	Hash$1.prototype['delete'] = _hashDelete;
	Hash$1.prototype.get = _hashGet;
	Hash$1.prototype.has = _hashHas;
	Hash$1.prototype.set = _hashSet;
	var _Hash = Hash$1;

	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */

	function mapCacheClear$1() {
	  this.size = 0;
	  this.__data__ = {
	    'hash': new _Hash(),
	    'map': new (_Map || _ListCache)(),
	    'string': new _Hash()
	  };
	}

	var _mapCacheClear = mapCacheClear$1;

	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable$1(value) {
	  var type = typeof value;
	  return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
	}

	var _isKeyable = isKeyable$1;

	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */

	function getMapData$1(map, key) {
	  var data = map.__data__;
	  return _isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
	}

	var _getMapData = getMapData$1;

	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */

	function mapCacheDelete$1(key) {
	  var result = _getMapData(this, key)['delete'](key);
	  this.size -= result ? 1 : 0;
	  return result;
	}

	var _mapCacheDelete = mapCacheDelete$1;

	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */

	function mapCacheGet$1(key) {
	  return _getMapData(this, key).get(key);
	}

	var _mapCacheGet = mapCacheGet$1;

	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */

	function mapCacheHas$1(key) {
	  return _getMapData(this, key).has(key);
	}

	var _mapCacheHas = mapCacheHas$1;

	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */

	function mapCacheSet$1(key, value) {
	  var data = _getMapData(this, key),
	      size = data.size;
	  data.set(key, value);
	  this.size += data.size == size ? 0 : 1;
	  return this;
	}

	var _mapCacheSet = mapCacheSet$1;

	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */

	function MapCache$1(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;
	  this.clear();

	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	} // Add methods to `MapCache`.


	MapCache$1.prototype.clear = _mapCacheClear;
	MapCache$1.prototype['delete'] = _mapCacheDelete;
	MapCache$1.prototype.get = _mapCacheGet;
	MapCache$1.prototype.has = _mapCacheHas;
	MapCache$1.prototype.set = _mapCacheSet;
	var _MapCache = MapCache$1;

	/** Used as the size to enable large array optimizations. */

	var LARGE_ARRAY_SIZE$1 = 200;
	/**
	 * Sets the stack `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Stack
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the stack cache instance.
	 */

	function stackSet$1(key, value) {
	  var data = this.__data__;

	  if (data instanceof _ListCache) {
	    var pairs = data.__data__;

	    if (!_Map || pairs.length < LARGE_ARRAY_SIZE$1 - 1) {
	      pairs.push([key, value]);
	      this.size = ++data.size;
	      return this;
	    }

	    data = this.__data__ = new _MapCache(pairs);
	  }

	  data.set(key, value);
	  this.size = data.size;
	  return this;
	}

	var _stackSet = stackSet$1;

	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */

	function Stack$1(entries) {
	  var data = this.__data__ = new _ListCache(entries);
	  this.size = data.size;
	} // Add methods to `Stack`.


	Stack$1.prototype.clear = _stackClear;
	Stack$1.prototype['delete'] = _stackDelete;
	Stack$1.prototype.get = _stackGet;
	Stack$1.prototype.has = _stackHas;
	Stack$1.prototype.set = _stackSet;
	var _Stack = Stack$1;

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED$4 = '__lodash_hash_undefined__';
	/**
	 * Adds `value` to the array cache.
	 *
	 * @private
	 * @name add
	 * @memberOf SetCache
	 * @alias push
	 * @param {*} value The value to cache.
	 * @returns {Object} Returns the cache instance.
	 */

	function setCacheAdd(value) {
	  this.__data__.set(value, HASH_UNDEFINED$4);

	  return this;
	}

	var _setCacheAdd = setCacheAdd;

	/**
	 * Checks if `value` is in the array cache.
	 *
	 * @private
	 * @name has
	 * @memberOf SetCache
	 * @param {*} value The value to search for.
	 * @returns {number} Returns `true` if `value` is found, else `false`.
	 */
	function setCacheHas(value) {
	  return this.__data__.has(value);
	}

	var _setCacheHas = setCacheHas;

	/**
	 *
	 * Creates an array cache object to store unique values.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [values] The values to cache.
	 */

	function SetCache(values) {
	  var index = -1,
	      length = values == null ? 0 : values.length;
	  this.__data__ = new _MapCache();

	  while (++index < length) {
	    this.add(values[index]);
	  }
	} // Add methods to `SetCache`.


	SetCache.prototype.add = SetCache.prototype.push = _setCacheAdd;
	SetCache.prototype.has = _setCacheHas;
	var _SetCache = SetCache;

	/**
	 * A specialized version of `_.some` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check,
	 *  else `false`.
	 */
	function arraySome(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length;

	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }

	  return false;
	}

	var _arraySome = arraySome;

	/**
	 * Checks if a `cache` value for `key` exists.
	 *
	 * @private
	 * @param {Object} cache The cache to query.
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function cacheHas(cache, key) {
	  return cache.has(key);
	}

	var _cacheHas = cacheHas;

	/** Used to compose bitmasks for value comparisons. */

	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;
	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `array` and `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */

	function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
	      arrLength = array.length,
	      othLength = other.length;

	  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
	    return false;
	  } // Assume cyclic values are equal.


	  var stacked = stack.get(array);

	  if (stacked && stack.get(other)) {
	    return stacked == other;
	  }

	  var index = -1,
	      result = true,
	      seen = bitmask & COMPARE_UNORDERED_FLAG ? new _SetCache() : undefined;
	  stack.set(array, other);
	  stack.set(other, array); // Ignore non-index properties.

	  while (++index < arrLength) {
	    var arrValue = array[index],
	        othValue = other[index];

	    if (customizer) {
	      var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
	    }

	    if (compared !== undefined) {
	      if (compared) {
	        continue;
	      }

	      result = false;
	      break;
	    } // Recursively compare arrays (susceptible to call stack limits).


	    if (seen) {
	      if (!_arraySome(other, function (othValue, othIndex) {
	        if (!_cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
	          return seen.push(othIndex);
	        }
	      })) {
	        result = false;
	        break;
	      }
	    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
	      result = false;
	      break;
	    }
	  }

	  stack['delete'](array);
	  stack['delete'](other);
	  return result;
	}

	var _equalArrays = equalArrays;

	/** Built-in value references. */

	var Uint8Array$1 = _root.Uint8Array;
	var _Uint8Array = Uint8Array$1;

	/**
	 * Converts `map` to its key-value pairs.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the key-value pairs.
	 */
	function mapToArray(map) {
	  var index = -1,
	      result = Array(map.size);
	  map.forEach(function (value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}

	var _mapToArray = mapToArray;

	/**
	 * Converts `set` to an array of its values.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the values.
	 */
	function setToArray(set) {
	  var index = -1,
	      result = Array(set.size);
	  set.forEach(function (value) {
	    result[++index] = value;
	  });
	  return result;
	}

	var _setToArray = setToArray;

	/** Used to compose bitmasks for value comparisons. */

	var COMPARE_PARTIAL_FLAG$1 = 1,
	    COMPARE_UNORDERED_FLAG$1 = 2;
	/** `Object#toString` result references. */

	var boolTag$1 = '[object Boolean]',
	    dateTag$1 = '[object Date]',
	    errorTag$1 = '[object Error]',
	    mapTag$1 = '[object Map]',
	    numberTag$1 = '[object Number]',
	    regexpTag$1 = '[object RegExp]',
	    setTag$1 = '[object Set]',
	    stringTag$1 = '[object String]',
	    symbolTag = '[object Symbol]';
	var arrayBufferTag$1 = '[object ArrayBuffer]',
	    dataViewTag$1 = '[object DataView]';
	/** Used to convert symbols to primitives and strings. */

	var symbolProto = _Symbol ? _Symbol.prototype : undefined,
	    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {string} tag The `toStringTag` of the objects to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */

	function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
	  switch (tag) {
	    case dataViewTag$1:
	      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
	        return false;
	      }

	      object = object.buffer;
	      other = other.buffer;

	    case arrayBufferTag$1:
	      if (object.byteLength != other.byteLength || !equalFunc(new _Uint8Array(object), new _Uint8Array(other))) {
	        return false;
	      }

	      return true;

	    case boolTag$1:
	    case dateTag$1:
	    case numberTag$1:
	      // Coerce booleans to `1` or `0` and dates to milliseconds.
	      // Invalid dates are coerced to `NaN`.
	      return eq_1(+object, +other);

	    case errorTag$1:
	      return object.name == other.name && object.message == other.message;

	    case regexpTag$1:
	    case stringTag$1:
	      // Coerce regexes to strings and treat strings, primitives and objects,
	      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
	      // for more details.
	      return object == other + '';

	    case mapTag$1:
	      var convert = _mapToArray;

	    case setTag$1:
	      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1;
	      convert || (convert = _setToArray);

	      if (object.size != other.size && !isPartial) {
	        return false;
	      } // Assume cyclic values are equal.


	      var stacked = stack.get(object);

	      if (stacked) {
	        return stacked == other;
	      }

	      bitmask |= COMPARE_UNORDERED_FLAG$1; // Recursively compare objects (susceptible to call stack limits).

	      stack.set(object, other);
	      var result = _equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
	      stack['delete'](object);
	      return result;

	    case symbolTag:
	      if (symbolValueOf) {
	        return symbolValueOf.call(object) == symbolValueOf.call(other);
	      }

	  }

	  return false;
	}

	var _equalByTag = equalByTag;

	/**
	 * Appends the elements of `values` to `array`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to append.
	 * @returns {Array} Returns `array`.
	 */
	function arrayPush(array, values) {
	  var index = -1,
	      length = values.length,
	      offset = array.length;

	  while (++index < length) {
	    array[offset + index] = values[index];
	  }

	  return array;
	}

	var _arrayPush = arrayPush;

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray$1 = Array.isArray;
	var isArray_1 = isArray$1;

	/**
	 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
	 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
	 * symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @param {Function} symbolsFunc The function to get the symbols of `object`.
	 * @returns {Array} Returns the array of property names and symbols.
	 */

	function baseGetAllKeys(object, keysFunc, symbolsFunc) {
	  var result = keysFunc(object);
	  return isArray_1(object) ? result : _arrayPush(result, symbolsFunc(object));
	}

	var _baseGetAllKeys = baseGetAllKeys;

	/**
	 * A specialized version of `_.filter` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 */
	function arrayFilter(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      resIndex = 0,
	      result = [];

	  while (++index < length) {
	    var value = array[index];

	    if (predicate(value, index, array)) {
	      result[resIndex++] = value;
	    }
	  }

	  return result;
	}

	var _arrayFilter = arrayFilter;

	/**
	 * This method returns a new empty array.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {Array} Returns the new empty array.
	 * @example
	 *
	 * var arrays = _.times(2, _.stubArray);
	 *
	 * console.log(arrays);
	 * // => [[], []]
	 *
	 * console.log(arrays[0] === arrays[1]);
	 * // => false
	 */
	function stubArray() {
	  return [];
	}

	var stubArray_1 = stubArray;

	/** Used for built-in method references. */

	var objectProto$g = Object.prototype;
	/** Built-in value references. */

	var propertyIsEnumerable$1 = objectProto$g.propertyIsEnumerable;
	/* Built-in method references for those with the same name as other `lodash` methods. */

	var nativeGetSymbols = Object.getOwnPropertySymbols;
	/**
	 * Creates an array of the own enumerable symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */

	var getSymbols = !nativeGetSymbols ? stubArray_1 : function (object) {
	  if (object == null) {
	    return [];
	  }

	  object = Object(object);
	  return _arrayFilter(nativeGetSymbols(object), function (symbol) {
	    return propertyIsEnumerable$1.call(object, symbol);
	  });
	};
	var _getSymbols = getSymbols;

	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */
	function baseTimes$1(n, iteratee) {
	  var index = -1,
	      result = Array(n);

	  while (++index < n) {
	    result[index] = iteratee(index);
	  }

	  return result;
	}

	var _baseTimes = baseTimes$1;

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike$1(value) {
	  return value != null && typeof value == 'object';
	}

	var isObjectLike_1 = isObjectLike$1;

	/** `Object#toString` result references. */

	var argsTag$2 = '[object Arguments]';
	/**
	 * The base implementation of `_.isArguments`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 */

	function baseIsArguments$1(value) {
	  return isObjectLike_1(value) && _baseGetTag(value) == argsTag$2;
	}

	var _baseIsArguments = baseIsArguments$1;

	/** Used for built-in method references. */

	var objectProto$h = Object.prototype;
	/** Used to check objects for own properties. */

	var hasOwnProperty$d = objectProto$h.hasOwnProperty;
	/** Built-in value references. */

	var propertyIsEnumerable$2 = objectProto$h.propertyIsEnumerable;
	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */

	var isArguments$1 = _baseIsArguments(function () {
	  return arguments;
	}()) ? _baseIsArguments : function (value) {
	  return isObjectLike_1(value) && hasOwnProperty$d.call(value, 'callee') && !propertyIsEnumerable$2.call(value, 'callee');
	};
	var isArguments_1 = isArguments$1;

	/**
	 * This method returns `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {boolean} Returns `false`.
	 * @example
	 *
	 * _.times(2, _.stubFalse);
	 * // => [false, false]
	 */
	function stubFalse$1() {
	  return false;
	}

	var stubFalse_1 = stubFalse$1;

	var isBuffer_1 = createCommonjsModule(function (module, exports) {
	  /** Detect free variable `exports`. */
	  var freeExports = exports && !exports.nodeType && exports;
	  /** Detect free variable `module`. */

	  var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;
	  /** Detect the popular CommonJS extension `module.exports`. */

	  var moduleExports = freeModule && freeModule.exports === freeExports;
	  /** Built-in value references. */

	  var Buffer = moduleExports ? _root.Buffer : undefined;
	  /* Built-in method references for those with the same name as other `lodash` methods. */

	  var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;
	  /**
	   * Checks if `value` is a buffer.
	   *
	   * @static
	   * @memberOf _
	   * @since 4.3.0
	   * @category Lang
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
	   * @example
	   *
	   * _.isBuffer(new Buffer(2));
	   * // => true
	   *
	   * _.isBuffer(new Uint8Array(2));
	   * // => false
	   */

	  var isBuffer = nativeIsBuffer || stubFalse_1;
	  module.exports = isBuffer;
	});

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER$2 = 9007199254740991;
	/** Used to detect unsigned integer values. */

	var reIsUint$1 = /^(?:0|[1-9]\d*)$/;
	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */

	function isIndex$1(value, length) {
	  var type = typeof value;
	  length = length == null ? MAX_SAFE_INTEGER$2 : length;
	  return !!length && (type == 'number' || type != 'symbol' && reIsUint$1.test(value)) && value > -1 && value % 1 == 0 && value < length;
	}

	var _isIndex = isIndex$1;

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER$3 = 9007199254740991;
	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */

	function isLength$1(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$3;
	}

	var isLength_1 = isLength$1;

	/** `Object#toString` result references. */

	var argsTag$3 = '[object Arguments]',
	    arrayTag$1 = '[object Array]',
	    boolTag$2 = '[object Boolean]',
	    dateTag$2 = '[object Date]',
	    errorTag$2 = '[object Error]',
	    funcTag$3 = '[object Function]',
	    mapTag$2 = '[object Map]',
	    numberTag$2 = '[object Number]',
	    objectTag$2 = '[object Object]',
	    regexpTag$2 = '[object RegExp]',
	    setTag$2 = '[object Set]',
	    stringTag$2 = '[object String]',
	    weakMapTag$1 = '[object WeakMap]';
	var arrayBufferTag$2 = '[object ArrayBuffer]',
	    dataViewTag$2 = '[object DataView]',
	    float32Tag$1 = '[object Float32Array]',
	    float64Tag$1 = '[object Float64Array]',
	    int8Tag$1 = '[object Int8Array]',
	    int16Tag$1 = '[object Int16Array]',
	    int32Tag$1 = '[object Int32Array]',
	    uint8Tag$1 = '[object Uint8Array]',
	    uint8ClampedTag$1 = '[object Uint8ClampedArray]',
	    uint16Tag$1 = '[object Uint16Array]',
	    uint32Tag$1 = '[object Uint32Array]';
	/** Used to identify `toStringTag` values of typed arrays. */

	var typedArrayTags$1 = {};
	typedArrayTags$1[float32Tag$1] = typedArrayTags$1[float64Tag$1] = typedArrayTags$1[int8Tag$1] = typedArrayTags$1[int16Tag$1] = typedArrayTags$1[int32Tag$1] = typedArrayTags$1[uint8Tag$1] = typedArrayTags$1[uint8ClampedTag$1] = typedArrayTags$1[uint16Tag$1] = typedArrayTags$1[uint32Tag$1] = true;
	typedArrayTags$1[argsTag$3] = typedArrayTags$1[arrayTag$1] = typedArrayTags$1[arrayBufferTag$2] = typedArrayTags$1[boolTag$2] = typedArrayTags$1[dataViewTag$2] = typedArrayTags$1[dateTag$2] = typedArrayTags$1[errorTag$2] = typedArrayTags$1[funcTag$3] = typedArrayTags$1[mapTag$2] = typedArrayTags$1[numberTag$2] = typedArrayTags$1[objectTag$2] = typedArrayTags$1[regexpTag$2] = typedArrayTags$1[setTag$2] = typedArrayTags$1[stringTag$2] = typedArrayTags$1[weakMapTag$1] = false;
	/**
	 * The base implementation of `_.isTypedArray` without Node.js optimizations.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 */

	function baseIsTypedArray$1(value) {
	  return isObjectLike_1(value) && isLength_1(value.length) && !!typedArrayTags$1[_baseGetTag(value)];
	}

	var _baseIsTypedArray = baseIsTypedArray$1;

	/**
	 * The base implementation of `_.unary` without support for storing metadata.
	 *
	 * @private
	 * @param {Function} func The function to cap arguments for.
	 * @returns {Function} Returns the new capped function.
	 */
	function baseUnary$1(func) {
	  return function (value) {
	    return func(value);
	  };
	}

	var _baseUnary = baseUnary$1;

	var _nodeUtil = createCommonjsModule(function (module, exports) {
	  /** Detect free variable `exports`. */
	  var freeExports = exports && !exports.nodeType && exports;
	  /** Detect free variable `module`. */

	  var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;
	  /** Detect the popular CommonJS extension `module.exports`. */

	  var moduleExports = freeModule && freeModule.exports === freeExports;
	  /** Detect free variable `process` from Node.js. */

	  var freeProcess = moduleExports && _freeGlobal.process;
	  /** Used to access faster Node.js helpers. */

	  var nodeUtil = function () {
	    try {
	      // Use `util.types` for Node.js 10+.
	      var types = freeModule && freeModule.require && freeModule.require('util').types;

	      if (types) {
	        return types;
	      } // Legacy `process.binding('util')` for Node.js < 10.


	      return freeProcess && freeProcess.binding && freeProcess.binding('util');
	    } catch (e) {}
	  }();

	  module.exports = nodeUtil;
	});

	/* Node.js helper references. */

	var nodeIsTypedArray$1 = _nodeUtil && _nodeUtil.isTypedArray;
	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */

	var isTypedArray$1 = nodeIsTypedArray$1 ? _baseUnary(nodeIsTypedArray$1) : _baseIsTypedArray;
	var isTypedArray_1 = isTypedArray$1;

	/** Used for built-in method references. */

	var objectProto$i = Object.prototype;
	/** Used to check objects for own properties. */

	var hasOwnProperty$e = objectProto$i.hasOwnProperty;
	/**
	 * Creates an array of the enumerable property names of the array-like `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @param {boolean} inherited Specify returning inherited property names.
	 * @returns {Array} Returns the array of property names.
	 */

	function arrayLikeKeys$1(value, inherited) {
	  var isArr = isArray_1(value),
	      isArg = !isArr && isArguments_1(value),
	      isBuff = !isArr && !isArg && isBuffer_1(value),
	      isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
	      skipIndexes = isArr || isArg || isBuff || isType,
	      result = skipIndexes ? _baseTimes(value.length, String) : [],
	      length = result.length;

	  for (var key in value) {
	    if ((inherited || hasOwnProperty$e.call(value, key)) && !(skipIndexes && ( // Safari 9 has enumerable `arguments.length` in strict mode.
	    key == 'length' || // Node.js 0.10 has enumerable non-index properties on buffers.
	    isBuff && (key == 'offset' || key == 'parent') || // PhantomJS 2 has enumerable non-index properties on typed arrays.
	    isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') || // Skip index properties.
	    _isIndex(key, length)))) {
	      result.push(key);
	    }
	  }

	  return result;
	}

	var _arrayLikeKeys = arrayLikeKeys$1;

	/** Used for built-in method references. */
	var objectProto$j = Object.prototype;
	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */

	function isPrototype$1(value) {
	  var Ctor = value && value.constructor,
	      proto = typeof Ctor == 'function' && Ctor.prototype || objectProto$j;
	  return value === proto;
	}

	var _isPrototype = isPrototype$1;

	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg$1(func, transform) {
	  return function (arg) {
	    return func(transform(arg));
	  };
	}

	var _overArg = overArg$1;

	/* Built-in method references for those with the same name as other `lodash` methods. */

	var nativeKeys = _overArg(Object.keys, Object);
	var _nativeKeys = nativeKeys;

	/** Used for built-in method references. */

	var objectProto$k = Object.prototype;
	/** Used to check objects for own properties. */

	var hasOwnProperty$f = objectProto$k.hasOwnProperty;
	/**
	 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */

	function baseKeys(object) {
	  if (!_isPrototype(object)) {
	    return _nativeKeys(object);
	  }

	  var result = [];

	  for (var key in Object(object)) {
	    if (hasOwnProperty$f.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }

	  return result;
	}

	var _baseKeys = baseKeys;

	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */

	function isArrayLike$1(value) {
	  return value != null && isLength_1(value.length) && !isFunction_1(value);
	}

	var isArrayLike_1 = isArrayLike$1;

	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */

	function keys(object) {
	  return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
	}

	var keys_1 = keys;

	/**
	 * Creates an array of own enumerable property names and symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */

	function getAllKeys(object) {
	  return _baseGetAllKeys(object, keys_1, _getSymbols);
	}

	var _getAllKeys = getAllKeys;

	/** Used to compose bitmasks for value comparisons. */

	var COMPARE_PARTIAL_FLAG$2 = 1;
	/** Used for built-in method references. */

	var objectProto$l = Object.prototype;
	/** Used to check objects for own properties. */

	var hasOwnProperty$g = objectProto$l.hasOwnProperty;
	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */

	function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2,
	      objProps = _getAllKeys(object),
	      objLength = objProps.length,
	      othProps = _getAllKeys(other),
	      othLength = othProps.length;

	  if (objLength != othLength && !isPartial) {
	    return false;
	  }

	  var index = objLength;

	  while (index--) {
	    var key = objProps[index];

	    if (!(isPartial ? key in other : hasOwnProperty$g.call(other, key))) {
	      return false;
	    }
	  } // Assume cyclic values are equal.


	  var stacked = stack.get(object);

	  if (stacked && stack.get(other)) {
	    return stacked == other;
	  }

	  var result = true;
	  stack.set(object, other);
	  stack.set(other, object);
	  var skipCtor = isPartial;

	  while (++index < objLength) {
	    key = objProps[index];
	    var objValue = object[key],
	        othValue = other[key];

	    if (customizer) {
	      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
	    } // Recursively compare objects (susceptible to call stack limits).


	    if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
	      result = false;
	      break;
	    }

	    skipCtor || (skipCtor = key == 'constructor');
	  }

	  if (result && !skipCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor; // Non `Object` object instances with different constructors are not equal.

	    if (objCtor != othCtor && 'constructor' in object && 'constructor' in other && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      result = false;
	    }
	  }

	  stack['delete'](object);
	  stack['delete'](other);
	  return result;
	}

	var _equalObjects = equalObjects;

	/* Built-in method references that are verified to be native. */

	var DataView = _getNative(_root, 'DataView');
	var _DataView = DataView;

	/* Built-in method references that are verified to be native. */

	var Promise$1 = _getNative(_root, 'Promise');
	var _Promise = Promise$1;

	/* Built-in method references that are verified to be native. */

	var Set = _getNative(_root, 'Set');
	var _Set = Set;

	/* Built-in method references that are verified to be native. */

	var WeakMap = _getNative(_root, 'WeakMap');
	var _WeakMap = WeakMap;

	/** `Object#toString` result references. */

	var mapTag$3 = '[object Map]',
	    objectTag$3 = '[object Object]',
	    promiseTag = '[object Promise]',
	    setTag$3 = '[object Set]',
	    weakMapTag$2 = '[object WeakMap]';
	var dataViewTag$3 = '[object DataView]';
	/** Used to detect maps, sets, and weakmaps. */

	var dataViewCtorString = _toSource(_DataView),
	    mapCtorString = _toSource(_Map),
	    promiseCtorString = _toSource(_Promise),
	    setCtorString = _toSource(_Set),
	    weakMapCtorString = _toSource(_WeakMap);
	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */

	var getTag = _baseGetTag; // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.

	if (_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag$3 || _Map && getTag(new _Map()) != mapTag$3 || _Promise && getTag(_Promise.resolve()) != promiseTag || _Set && getTag(new _Set()) != setTag$3 || _WeakMap && getTag(new _WeakMap()) != weakMapTag$2) {
	  getTag = function (value) {
	    var result = _baseGetTag(value),
	        Ctor = result == objectTag$3 ? value.constructor : undefined,
	        ctorString = Ctor ? _toSource(Ctor) : '';

	    if (ctorString) {
	      switch (ctorString) {
	        case dataViewCtorString:
	          return dataViewTag$3;

	        case mapCtorString:
	          return mapTag$3;

	        case promiseCtorString:
	          return promiseTag;

	        case setCtorString:
	          return setTag$3;

	        case weakMapCtorString:
	          return weakMapTag$2;
	      }
	    }

	    return result;
	  };
	}

	var _getTag = getTag;

	/** Used to compose bitmasks for value comparisons. */

	var COMPARE_PARTIAL_FLAG$3 = 1;
	/** `Object#toString` result references. */

	var argsTag$4 = '[object Arguments]',
	    arrayTag$2 = '[object Array]',
	    objectTag$4 = '[object Object]';
	/** Used for built-in method references. */

	var objectProto$m = Object.prototype;
	/** Used to check objects for own properties. */

	var hasOwnProperty$h = objectProto$m.hasOwnProperty;
	/**
	 * A specialized version of `baseIsEqual` for arrays and objects which performs
	 * deep comparisons and tracks traversed objects enabling objects with circular
	 * references to be compared.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */

	function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
	  var objIsArr = isArray_1(object),
	      othIsArr = isArray_1(other),
	      objTag = objIsArr ? arrayTag$2 : _getTag(object),
	      othTag = othIsArr ? arrayTag$2 : _getTag(other);
	  objTag = objTag == argsTag$4 ? objectTag$4 : objTag;
	  othTag = othTag == argsTag$4 ? objectTag$4 : othTag;
	  var objIsObj = objTag == objectTag$4,
	      othIsObj = othTag == objectTag$4,
	      isSameTag = objTag == othTag;

	  if (isSameTag && isBuffer_1(object)) {
	    if (!isBuffer_1(other)) {
	      return false;
	    }

	    objIsArr = true;
	    objIsObj = false;
	  }

	  if (isSameTag && !objIsObj) {
	    stack || (stack = new _Stack());
	    return objIsArr || isTypedArray_1(object) ? _equalArrays(object, other, bitmask, customizer, equalFunc, stack) : _equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
	  }

	  if (!(bitmask & COMPARE_PARTIAL_FLAG$3)) {
	    var objIsWrapped = objIsObj && hasOwnProperty$h.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty$h.call(other, '__wrapped__');

	    if (objIsWrapped || othIsWrapped) {
	      var objUnwrapped = objIsWrapped ? object.value() : object,
	          othUnwrapped = othIsWrapped ? other.value() : other;
	      stack || (stack = new _Stack());
	      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
	    }
	  }

	  if (!isSameTag) {
	    return false;
	  }

	  stack || (stack = new _Stack());
	  return _equalObjects(object, other, bitmask, customizer, equalFunc, stack);
	}

	var _baseIsEqualDeep = baseIsEqualDeep;

	/**
	 * The base implementation of `_.isEqual` which supports partial comparisons
	 * and tracks traversed objects.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {boolean} bitmask The bitmask flags.
	 *  1 - Unordered comparison
	 *  2 - Partial comparison
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */

	function baseIsEqual(value, other, bitmask, customizer, stack) {
	  if (value === other) {
	    return true;
	  }

	  if (value == null || other == null || !isObjectLike_1(value) && !isObjectLike_1(other)) {
	    return value !== value && other !== other;
	  }

	  return _baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
	}

	var _baseIsEqual = baseIsEqual;

	/** Used to compose bitmasks for value comparisons. */

	var COMPARE_PARTIAL_FLAG$4 = 1,
	    COMPARE_UNORDERED_FLAG$2 = 2;
	/**
	 * The base implementation of `_.isMatch` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @param {Object} source The object of property values to match.
	 * @param {Array} matchData The property names, values, and compare flags to match.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	 */

	function baseIsMatch(object, source, matchData, customizer) {
	  var index = matchData.length,
	      length = index,
	      noCustomizer = !customizer;

	  if (object == null) {
	    return !length;
	  }

	  object = Object(object);

	  while (index--) {
	    var data = matchData[index];

	    if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
	      return false;
	    }
	  }

	  while (++index < length) {
	    data = matchData[index];
	    var key = data[0],
	        objValue = object[key],
	        srcValue = data[1];

	    if (noCustomizer && data[2]) {
	      if (objValue === undefined && !(key in object)) {
	        return false;
	      }
	    } else {
	      var stack = new _Stack();

	      if (customizer) {
	        var result = customizer(objValue, srcValue, key, object, source, stack);
	      }

	      if (!(result === undefined ? _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$4 | COMPARE_UNORDERED_FLAG$2, customizer, stack) : result)) {
	        return false;
	      }
	    }
	  }

	  return true;
	}

	var _baseIsMatch = baseIsMatch;

	/**
	 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` if suitable for strict
	 *  equality comparisons, else `false`.
	 */

	function isStrictComparable(value) {
	  return value === value && !isObject_1(value);
	}

	var _isStrictComparable = isStrictComparable;

	/**
	 * Gets the property names, values, and compare flags of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the match data of `object`.
	 */

	function getMatchData(object) {
	  var result = keys_1(object),
	      length = result.length;

	  while (length--) {
	    var key = result[length],
	        value = object[key];
	    result[length] = [key, value, _isStrictComparable(value)];
	  }

	  return result;
	}

	var _getMatchData = getMatchData;

	/**
	 * A specialized version of `matchesProperty` for source values suitable
	 * for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function matchesStrictComparable(key, srcValue) {
	  return function (object) {
	    if (object == null) {
	      return false;
	    }

	    return object[key] === srcValue && (srcValue !== undefined || key in Object(object));
	  };
	}

	var _matchesStrictComparable = matchesStrictComparable;

	/**
	 * The base implementation of `_.matches` which doesn't clone `source`.
	 *
	 * @private
	 * @param {Object} source The object of property values to match.
	 * @returns {Function} Returns the new spec function.
	 */

	function baseMatches(source) {
	  var matchData = _getMatchData(source);

	  if (matchData.length == 1 && matchData[0][2]) {
	    return _matchesStrictComparable(matchData[0][0], matchData[0][1]);
	  }

	  return function (object) {
	    return object === source || _baseIsMatch(object, source, matchData);
	  };
	}

	var _baseMatches = baseMatches;

	/** `Object#toString` result references. */

	var symbolTag$1 = '[object Symbol]';
	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */

	function isSymbol(value) {
	  return typeof value == 'symbol' || isObjectLike_1(value) && _baseGetTag(value) == symbolTag$1;
	}

	var isSymbol_1 = isSymbol;

	/** Used to match property names within property paths. */

	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
	    reIsPlainProp = /^\w*$/;
	/**
	 * Checks if `value` is a property name and not a property path.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	 */

	function isKey(value, object) {
	  if (isArray_1(value)) {
	    return false;
	  }

	  var type = typeof value;

	  if (type == 'number' || type == 'symbol' || type == 'boolean' || value == null || isSymbol_1(value)) {
	    return true;
	  }

	  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
	}

	var _isKey = isKey;

	/** Error message constants. */

	var FUNC_ERROR_TEXT = 'Expected a function';
	/**
	 * Creates a function that memoizes the result of `func`. If `resolver` is
	 * provided, it determines the cache key for storing the result based on the
	 * arguments provided to the memoized function. By default, the first argument
	 * provided to the memoized function is used as the map cache key. The `func`
	 * is invoked with the `this` binding of the memoized function.
	 *
	 * **Note:** The cache is exposed as the `cache` property on the memoized
	 * function. Its creation may be customized by replacing the `_.memoize.Cache`
	 * constructor with one whose instances implement the
	 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
	 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to have its output memoized.
	 * @param {Function} [resolver] The function to resolve the cache key.
	 * @returns {Function} Returns the new memoized function.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': 2 };
	 * var other = { 'c': 3, 'd': 4 };
	 *
	 * var values = _.memoize(_.values);
	 * values(object);
	 * // => [1, 2]
	 *
	 * values(other);
	 * // => [3, 4]
	 *
	 * object.a = 2;
	 * values(object);
	 * // => [1, 2]
	 *
	 * // Modify the result cache.
	 * values.cache.set(object, ['a', 'b']);
	 * values(object);
	 * // => ['a', 'b']
	 *
	 * // Replace `_.memoize.Cache`.
	 * _.memoize.Cache = WeakMap;
	 */

	function memoize(func, resolver) {
	  if (typeof func != 'function' || resolver != null && typeof resolver != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }

	  var memoized = function () {
	    var args = arguments,
	        key = resolver ? resolver.apply(this, args) : args[0],
	        cache = memoized.cache;

	    if (cache.has(key)) {
	      return cache.get(key);
	    }

	    var result = func.apply(this, args);
	    memoized.cache = cache.set(key, result) || cache;
	    return result;
	  };

	  memoized.cache = new (memoize.Cache || _MapCache)();
	  return memoized;
	} // Expose `MapCache`.


	memoize.Cache = _MapCache;
	var memoize_1 = memoize;

	/** Used as the maximum memoize cache size. */

	var MAX_MEMOIZE_SIZE = 500;
	/**
	 * A specialized version of `_.memoize` which clears the memoized function's
	 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
	 *
	 * @private
	 * @param {Function} func The function to have its output memoized.
	 * @returns {Function} Returns the new memoized function.
	 */

	function memoizeCapped(func) {
	  var result = memoize_1(func, function (key) {
	    if (cache.size === MAX_MEMOIZE_SIZE) {
	      cache.clear();
	    }

	    return key;
	  });
	  var cache = result.cache;
	  return result;
	}

	var _memoizeCapped = memoizeCapped;

	/** Used to match property names within property paths. */

	var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
	/** Used to match backslashes in property paths. */

	var reEscapeChar = /\\(\\)?/g;
	/**
	 * Converts `string` to a property path array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the property path array.
	 */

	var stringToPath = _memoizeCapped(function (string) {
	  var result = [];

	  if (string.charCodeAt(0) === 46
	  /* . */
	  ) {
	      result.push('');
	    }

	  string.replace(rePropName, function (match, number, quote, subString) {
	    result.push(quote ? subString.replace(reEscapeChar, '$1') : number || match);
	  });
	  return result;
	});
	var _stringToPath = stringToPath;

	/**
	 * A specialized version of `_.map` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function arrayMap(array, iteratee) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      result = Array(length);

	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }

	  return result;
	}

	var _arrayMap = arrayMap;

	/** Used as references for various `Number` constants. */

	var INFINITY = 1 / 0;
	/** Used to convert symbols to primitives and strings. */

	var symbolProto$1 = _Symbol ? _Symbol.prototype : undefined,
	    symbolToString = symbolProto$1 ? symbolProto$1.toString : undefined;
	/**
	 * The base implementation of `_.toString` which doesn't convert nullish
	 * values to empty strings.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */

	function baseToString(value) {
	  // Exit early for strings to avoid a performance hit in some environments.
	  if (typeof value == 'string') {
	    return value;
	  }

	  if (isArray_1(value)) {
	    // Recursively convert values (susceptible to call stack limits).
	    return _arrayMap(value, baseToString) + '';
	  }

	  if (isSymbol_1(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }

	  var result = value + '';
	  return result == '0' && 1 / value == -INFINITY ? '-0' : result;
	}

	var _baseToString = baseToString;

	/**
	 * Converts `value` to a string. An empty string is returned for `null`
	 * and `undefined` values. The sign of `-0` is preserved.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 * @example
	 *
	 * _.toString(null);
	 * // => ''
	 *
	 * _.toString(-0);
	 * // => '-0'
	 *
	 * _.toString([1, 2, 3]);
	 * // => '1,2,3'
	 */

	function toString(value) {
	  return value == null ? '' : _baseToString(value);
	}

	var toString_1 = toString;

	/**
	 * Casts `value` to a path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {Array} Returns the cast property path array.
	 */

	function castPath(value, object) {
	  if (isArray_1(value)) {
	    return value;
	  }

	  return _isKey(value, object) ? [value] : _stringToPath(toString_1(value));
	}

	var _castPath = castPath;

	/** Used as references for various `Number` constants. */

	var INFINITY$1 = 1 / 0;
	/**
	 * Converts `value` to a string key if it's not a string or symbol.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {string|symbol} Returns the key.
	 */

	function toKey(value) {
	  if (typeof value == 'string' || isSymbol_1(value)) {
	    return value;
	  }

	  var result = value + '';
	  return result == '0' && 1 / value == -INFINITY$1 ? '-0' : result;
	}

	var _toKey = toKey;

	/**
	 * The base implementation of `_.get` without support for default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @returns {*} Returns the resolved value.
	 */

	function baseGet(object, path) {
	  path = _castPath(path, object);
	  var index = 0,
	      length = path.length;

	  while (object != null && index < length) {
	    object = object[_toKey(path[index++])];
	  }

	  return index && index == length ? object : undefined;
	}

	var _baseGet = baseGet;

	/**
	 * Gets the value at `path` of `object`. If the resolved value is
	 * `undefined`, the `defaultValue` is returned in its place.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.7.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
	 * @returns {*} Returns the resolved value.
	 * @example
	 *
	 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	 *
	 * _.get(object, 'a[0].b.c');
	 * // => 3
	 *
	 * _.get(object, ['a', '0', 'b', 'c']);
	 * // => 3
	 *
	 * _.get(object, 'a.b.c', 'default');
	 * // => 'default'
	 */

	function get(object, path, defaultValue) {
	  var result = object == null ? undefined : _baseGet(object, path);
	  return result === undefined ? defaultValue : result;
	}

	var get_1 = get;

	/**
	 * The base implementation of `_.hasIn` without support for deep paths.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */
	function baseHasIn(object, key) {
	  return object != null && key in Object(object);
	}

	var _baseHasIn = baseHasIn;

	/**
	 * Checks if `path` exists on `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @param {Function} hasFunc The function to check properties.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 */

	function hasPath(object, path, hasFunc) {
	  path = _castPath(path, object);
	  var index = -1,
	      length = path.length,
	      result = false;

	  while (++index < length) {
	    var key = _toKey(path[index]);

	    if (!(result = object != null && hasFunc(object, key))) {
	      break;
	    }

	    object = object[key];
	  }

	  if (result || ++index != length) {
	    return result;
	  }

	  length = object == null ? 0 : object.length;
	  return !!length && isLength_1(length) && _isIndex(key, length) && (isArray_1(object) || isArguments_1(object));
	}

	var _hasPath = hasPath;

	/**
	 * Checks if `path` is a direct or inherited property of `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 * @example
	 *
	 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
	 *
	 * _.hasIn(object, 'a');
	 * // => true
	 *
	 * _.hasIn(object, 'a.b');
	 * // => true
	 *
	 * _.hasIn(object, ['a', 'b']);
	 * // => true
	 *
	 * _.hasIn(object, 'b');
	 * // => false
	 */

	function hasIn(object, path) {
	  return object != null && _hasPath(object, path, _baseHasIn);
	}

	var hasIn_1 = hasIn;

	/** Used to compose bitmasks for value comparisons. */

	var COMPARE_PARTIAL_FLAG$5 = 1,
	    COMPARE_UNORDERED_FLAG$3 = 2;
	/**
	 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
	 *
	 * @private
	 * @param {string} path The path of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */

	function baseMatchesProperty(path, srcValue) {
	  if (_isKey(path) && _isStrictComparable(srcValue)) {
	    return _matchesStrictComparable(_toKey(path), srcValue);
	  }

	  return function (object) {
	    var objValue = get_1(object, path);
	    return objValue === undefined && objValue === srcValue ? hasIn_1(object, path) : _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$5 | COMPARE_UNORDERED_FLAG$3);
	  };
	}

	var _baseMatchesProperty = baseMatchesProperty;

	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */
	function identity$1(value) {
	  return value;
	}

	var identity_1 = identity$1;

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function baseProperty(key) {
	  return function (object) {
	    return object == null ? undefined : object[key];
	  };
	}

	var _baseProperty = baseProperty;

	/**
	 * A specialized version of `baseProperty` which supports deep paths.
	 *
	 * @private
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */

	function basePropertyDeep(path) {
	  return function (object) {
	    return _baseGet(object, path);
	  };
	}

	var _basePropertyDeep = basePropertyDeep;

	/**
	 * Creates a function that returns the value at `path` of a given object.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 * @example
	 *
	 * var objects = [
	 *   { 'a': { 'b': 2 } },
	 *   { 'a': { 'b': 1 } }
	 * ];
	 *
	 * _.map(objects, _.property('a.b'));
	 * // => [2, 1]
	 *
	 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
	 * // => [1, 2]
	 */

	function property(path) {
	  return _isKey(path) ? _baseProperty(_toKey(path)) : _basePropertyDeep(path);
	}

	var property_1 = property;

	/**
	 * The base implementation of `_.iteratee`.
	 *
	 * @private
	 * @param {*} [value=_.identity] The value to convert to an iteratee.
	 * @returns {Function} Returns the iteratee.
	 */

	function baseIteratee(value) {
	  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
	  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
	  if (typeof value == 'function') {
	    return value;
	  }

	  if (value == null) {
	    return identity_1;
	  }

	  if (typeof value == 'object') {
	    return isArray_1(value) ? _baseMatchesProperty(value[0], value[1]) : _baseMatches(value);
	  }

	  return property_1(value);
	}

	var _baseIteratee = baseIteratee;

	/**
	 * Gets the last element of `array`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to query.
	 * @returns {*} Returns the last element of `array`.
	 * @example
	 *
	 * _.last([1, 2, 3]);
	 * // => 3
	 */
	function last(array) {
	  var length = array == null ? 0 : array.length;
	  return length ? array[length - 1] : undefined;
	}

	var last_1 = last;

	/**
	 * The base implementation of `_.slice` without an iteratee call guard.
	 *
	 * @private
	 * @param {Array} array The array to slice.
	 * @param {number} [start=0] The start position.
	 * @param {number} [end=array.length] The end position.
	 * @returns {Array} Returns the slice of `array`.
	 */
	function baseSlice(array, start, end) {
	  var index = -1,
	      length = array.length;

	  if (start < 0) {
	    start = -start > length ? 0 : length + start;
	  }

	  end = end > length ? length : end;

	  if (end < 0) {
	    end += length;
	  }

	  length = start > end ? 0 : end - start >>> 0;
	  start >>>= 0;
	  var result = Array(length);

	  while (++index < length) {
	    result[index] = array[index + start];
	  }

	  return result;
	}

	var _baseSlice = baseSlice;

	/**
	 * Gets the parent value at `path` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array} path The path to get the parent value of.
	 * @returns {*} Returns the parent value.
	 */

	function parent(object, path) {
	  return path.length < 2 ? object : _baseGet(object, _baseSlice(path, 0, -1));
	}

	var _parent = parent;

	/**
	 * The base implementation of `_.unset`.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {Array|string} path The property path to unset.
	 * @returns {boolean} Returns `true` if the property is deleted, else `false`.
	 */

	function baseUnset(object, path) {
	  path = _castPath(path, object);
	  object = _parent(object, path);
	  return object == null || delete object[_toKey(last_1(path))];
	}

	var _baseUnset = baseUnset;

	/** Used for built-in method references. */

	var arrayProto$2 = Array.prototype;
	/** Built-in value references. */

	var splice$2 = arrayProto$2.splice;
	/**
	 * The base implementation of `_.pullAt` without support for individual
	 * indexes or capturing the removed elements.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {number[]} indexes The indexes of elements to remove.
	 * @returns {Array} Returns `array`.
	 */

	function basePullAt(array, indexes) {
	  var length = array ? indexes.length : 0,
	      lastIndex = length - 1;

	  while (length--) {
	    var index = indexes[length];

	    if (length == lastIndex || index !== previous) {
	      var previous = index;

	      if (_isIndex(index)) {
	        splice$2.call(array, index, 1);
	      } else {
	        _baseUnset(array, index);
	      }
	    }
	  }

	  return array;
	}

	var _basePullAt = basePullAt;

	/**
	 * Removes all elements from `array` that `predicate` returns truthy for
	 * and returns an array of the removed elements. The predicate is invoked
	 * with three arguments: (value, index, array).
	 *
	 * **Note:** Unlike `_.filter`, this method mutates `array`. Use `_.pull`
	 * to pull elements from an array by value.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.0.0
	 * @category Array
	 * @param {Array} array The array to modify.
	 * @param {Function} [predicate=_.identity] The function invoked per iteration.
	 * @returns {Array} Returns the new array of removed elements.
	 * @example
	 *
	 * var array = [1, 2, 3, 4];
	 * var evens = _.remove(array, function(n) {
	 *   return n % 2 == 0;
	 * });
	 *
	 * console.log(array);
	 * // => [1, 3]
	 *
	 * console.log(evens);
	 * // => [2, 4]
	 */

	function remove(array, predicate) {
	  var result = [];

	  if (!(array && array.length)) {
	    return result;
	  }

	  var index = -1,
	      indexes = [],
	      length = array.length;
	  predicate = _baseIteratee(predicate, 3);

	  while (++index < length) {
	    var value = array[index];

	    if (predicate(value, index, array)) {
	      result.push(value);
	      indexes.push(index);
	    }
	  }

	  _basePullAt(array, indexes);
	  return result;
	}

	var remove_1 = remove;

	/**
	 * 用于事件处理
	 *
	 * */

	var Signal =
	/*#__PURE__*/
	function () {
	  function Signal(type) {
	    _classCallCheck(this, Signal);

	    this.type = type;
	    this.functionArr = [];
	  }

	  _createClass(Signal, [{
	    key: "add",
	    value: function add(func) {
	      if (typeof func !== 'function') {
	        throw new NotFunctionError();
	      } else {
	        this.functionArr.push(func);
	      }
	    }
	  }, {
	    key: "remove",
	    value: function remove(func) {
	      return remove_1(this.functionArr, function (n) {
	        return n === func;
	      });
	    }
	  }, {
	    key: "run",
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
	  _classCallCheck(this, Events);

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
	      if (!_iteratorNormalCompletion && _iterator.return != null) {
	        _iterator.return();
	      }
	    } finally {
	      if (_didIteratorError) {
	        throw _iteratorError;
	      }
	    }
	  }
	};

	var FBOEventMapper =
	/*#__PURE__*/
	function () {
	  function FBOEventMapper(fboWorld, mesh, faceIndexArr) {
	    _classCallCheck(this, FBOEventMapper);

	    this.world = fboWorld;
	    this.disable = false;
	    this.isDeep = true;
	    this.receivers = fboWorld.receivers;
	    this.raycaster = new three.Raycaster();
	    this.mesh = mesh;
	    this.faceIndexArr = faceIndexArr || [];
	  }

	  _createClass(FBOEventMapper, [{
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

	/**
	 * A faster alternative to `Function#apply`, this function invokes `func`
	 * with the `this` binding of `thisArg` and the arguments of `args`.
	 *
	 * @private
	 * @param {Function} func The function to invoke.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {Array} args The arguments to invoke `func` with.
	 * @returns {*} Returns the result of `func`.
	 */
	function apply$1(func, thisArg, args) {
	  switch (args.length) {
	    case 0:
	      return func.call(thisArg);

	    case 1:
	      return func.call(thisArg, args[0]);

	    case 2:
	      return func.call(thisArg, args[0], args[1]);

	    case 3:
	      return func.call(thisArg, args[0], args[1], args[2]);
	  }

	  return func.apply(thisArg, args);
	}

	var _apply = apply$1;

	/* Built-in method references for those with the same name as other `lodash` methods. */

	var nativeMax$1 = Math.max;
	/**
	 * A specialized version of `baseRest` which transforms the rest array.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @param {Function} transform The rest array transform.
	 * @returns {Function} Returns the new function.
	 */

	function overRest$1(func, start, transform) {
	  start = nativeMax$1(start === undefined ? func.length - 1 : start, 0);
	  return function () {
	    var args = arguments,
	        index = -1,
	        length = nativeMax$1(args.length - start, 0),
	        array = Array(length);

	    while (++index < length) {
	      array[index] = args[start + index];
	    }

	    index = -1;
	    var otherArgs = Array(start + 1);

	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }

	    otherArgs[start] = transform(array);
	    return _apply(func, this, otherArgs);
	  };
	}

	var _overRest = overRest$1;

	/**
	 * Creates a function that returns `value`.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {*} value The value to return from the new function.
	 * @returns {Function} Returns the new constant function.
	 * @example
	 *
	 * var objects = _.times(2, _.constant({ 'a': 1 }));
	 *
	 * console.log(objects);
	 * // => [{ 'a': 1 }, { 'a': 1 }]
	 *
	 * console.log(objects[0] === objects[1]);
	 * // => true
	 */
	function constant$1(value) {
	  return function () {
	    return value;
	  };
	}

	var constant_1 = constant$1;

	var defineProperty$1 = function () {
	  try {
	    var func = _getNative(Object, 'defineProperty');
	    func({}, '', {});
	    return func;
	  } catch (e) {}
	}();

	var _defineProperty$1 = defineProperty$1;

	/**
	 * The base implementation of `setToString` without support for hot loop shorting.
	 *
	 * @private
	 * @param {Function} func The function to modify.
	 * @param {Function} string The `toString` result.
	 * @returns {Function} Returns `func`.
	 */

	var baseSetToString$1 = !_defineProperty$1 ? identity_1 : function (func, string) {
	  return _defineProperty$1(func, 'toString', {
	    'configurable': true,
	    'enumerable': false,
	    'value': constant_1(string),
	    'writable': true
	  });
	};
	var _baseSetToString = baseSetToString$1;

	/** Used to detect hot functions by number of calls within a span of milliseconds. */
	var HOT_COUNT$1 = 800,
	    HOT_SPAN$1 = 16;
	/* Built-in method references for those with the same name as other `lodash` methods. */

	var nativeNow$1 = Date.now;
	/**
	 * Creates a function that'll short out and invoke `identity` instead
	 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
	 * milliseconds.
	 *
	 * @private
	 * @param {Function} func The function to restrict.
	 * @returns {Function} Returns the new shortable function.
	 */

	function shortOut$1(func) {
	  var count = 0,
	      lastCalled = 0;
	  return function () {
	    var stamp = nativeNow$1(),
	        remaining = HOT_SPAN$1 - (stamp - lastCalled);
	    lastCalled = stamp;

	    if (remaining > 0) {
	      if (++count >= HOT_COUNT$1) {
	        return arguments[0];
	      }
	    } else {
	      count = 0;
	    }

	    return func.apply(undefined, arguments);
	  };
	}

	var _shortOut = shortOut$1;

	/**
	 * Sets the `toString` method of `func` to return `string`.
	 *
	 * @private
	 * @param {Function} func The function to modify.
	 * @param {Function} string The `toString` result.
	 * @returns {Function} Returns `func`.
	 */

	var setToString$1 = _shortOut(_baseSetToString);
	var _setToString = setToString$1;

	/**
	 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 */

	function baseRest$1(func, start) {
	  return _setToString(_overRest(func, start, identity_1), func + '');
	}

	var _baseRest = baseRest$1;

	/**
	 * The base implementation of `assignValue` and `assignMergeValue` without
	 * value checks.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */

	function baseAssignValue$1(object, key, value) {
	  if (key == '__proto__' && _defineProperty$1) {
	    _defineProperty$1(object, key, {
	      'configurable': true,
	      'enumerable': true,
	      'value': value,
	      'writable': true
	    });
	  } else {
	    object[key] = value;
	  }
	}

	var _baseAssignValue = baseAssignValue$1;

	/**
	 * This function is like `assignValue` except that it doesn't assign
	 * `undefined` values.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */

	function assignMergeValue$1(object, key, value) {
	  if (value !== undefined && !eq_1(object[key], value) || value === undefined && !(key in object)) {
	    _baseAssignValue(object, key, value);
	  }
	}

	var _assignMergeValue = assignMergeValue$1;

	/**
	 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor$1(fromRight) {
	  return function (object, iteratee, keysFunc) {
	    var index = -1,
	        iterable = Object(object),
	        props = keysFunc(object),
	        length = props.length;

	    while (length--) {
	      var key = props[fromRight ? length : ++index];

	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }

	    return object;
	  };
	}

	var _createBaseFor = createBaseFor$1;

	/**
	 * The base implementation of `baseForOwn` which iterates over `object`
	 * properties returned by `keysFunc` and invokes `iteratee` for each property.
	 * Iteratee functions may exit iteration early by explicitly returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */

	var baseFor$1 = _createBaseFor();
	var _baseFor = baseFor$1;

	var _cloneBuffer = createCommonjsModule(function (module, exports) {
	  /** Detect free variable `exports`. */
	  var freeExports = exports && !exports.nodeType && exports;
	  /** Detect free variable `module`. */

	  var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;
	  /** Detect the popular CommonJS extension `module.exports`. */

	  var moduleExports = freeModule && freeModule.exports === freeExports;
	  /** Built-in value references. */

	  var Buffer = moduleExports ? _root.Buffer : undefined,
	      allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;
	  /**
	   * Creates a clone of  `buffer`.
	   *
	   * @private
	   * @param {Buffer} buffer The buffer to clone.
	   * @param {boolean} [isDeep] Specify a deep clone.
	   * @returns {Buffer} Returns the cloned buffer.
	   */

	  function cloneBuffer(buffer, isDeep) {
	    if (isDeep) {
	      return buffer.slice();
	    }

	    var length = buffer.length,
	        result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
	    buffer.copy(result);
	    return result;
	  }

	  module.exports = cloneBuffer;
	});

	/**
	 * Creates a clone of `arrayBuffer`.
	 *
	 * @private
	 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
	 * @returns {ArrayBuffer} Returns the cloned array buffer.
	 */

	function cloneArrayBuffer$1(arrayBuffer) {
	  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
	  new _Uint8Array(result).set(new _Uint8Array(arrayBuffer));
	  return result;
	}

	var _cloneArrayBuffer = cloneArrayBuffer$1;

	/**
	 * Creates a clone of `typedArray`.
	 *
	 * @private
	 * @param {Object} typedArray The typed array to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned typed array.
	 */

	function cloneTypedArray$1(typedArray, isDeep) {
	  var buffer = isDeep ? _cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
	  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
	}

	var _cloneTypedArray = cloneTypedArray$1;

	/**
	 * Copies the values of `source` to `array`.
	 *
	 * @private
	 * @param {Array} source The array to copy values from.
	 * @param {Array} [array=[]] The array to copy values to.
	 * @returns {Array} Returns `array`.
	 */
	function copyArray$1(source, array) {
	  var index = -1,
	      length = source.length;
	  array || (array = Array(length));

	  while (++index < length) {
	    array[index] = source[index];
	  }

	  return array;
	}

	var _copyArray = copyArray$1;

	/** Built-in value references. */

	var objectCreate$1 = Object.create;
	/**
	 * The base implementation of `_.create` without support for assigning
	 * properties to the created object.
	 *
	 * @private
	 * @param {Object} proto The object to inherit from.
	 * @returns {Object} Returns the new object.
	 */

	var baseCreate$1 = function () {
	  function object() {}

	  return function (proto) {
	    if (!isObject_1(proto)) {
	      return {};
	    }

	    if (objectCreate$1) {
	      return objectCreate$1(proto);
	    }

	    object.prototype = proto;
	    var result = new object();
	    object.prototype = undefined;
	    return result;
	  };
	}();

	var _baseCreate = baseCreate$1;

	/** Built-in value references. */

	var getPrototype$1 = _overArg(Object.getPrototypeOf, Object);
	var _getPrototype = getPrototype$1;

	/**
	 * Initializes an object clone.
	 *
	 * @private
	 * @param {Object} object The object to clone.
	 * @returns {Object} Returns the initialized clone.
	 */

	function initCloneObject$1(object) {
	  return typeof object.constructor == 'function' && !_isPrototype(object) ? _baseCreate(_getPrototype(object)) : {};
	}

	var _initCloneObject = initCloneObject$1;

	/**
	 * This method is like `_.isArrayLike` except that it also checks if `value`
	 * is an object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array-like object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArrayLikeObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLikeObject(document.body.children);
	 * // => true
	 *
	 * _.isArrayLikeObject('abc');
	 * // => false
	 *
	 * _.isArrayLikeObject(_.noop);
	 * // => false
	 */

	function isArrayLikeObject$1(value) {
	  return isObjectLike_1(value) && isArrayLike_1(value);
	}

	var isArrayLikeObject_1 = isArrayLikeObject$1;

	/** `Object#toString` result references. */

	var objectTag$5 = '[object Object]';
	/** Used for built-in method references. */

	var funcProto$5 = Function.prototype,
	    objectProto$n = Object.prototype;
	/** Used to resolve the decompiled source of functions. */

	var funcToString$5 = funcProto$5.toString;
	/** Used to check objects for own properties. */

	var hasOwnProperty$i = objectProto$n.hasOwnProperty;
	/** Used to infer the `Object` constructor. */

	var objectCtorString$1 = funcToString$5.call(Object);
	/**
	 * Checks if `value` is a plain object, that is, an object created by the
	 * `Object` constructor or one with a `[[Prototype]]` of `null`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.8.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * _.isPlainObject(new Foo);
	 * // => false
	 *
	 * _.isPlainObject([1, 2, 3]);
	 * // => false
	 *
	 * _.isPlainObject({ 'x': 0, 'y': 0 });
	 * // => true
	 *
	 * _.isPlainObject(Object.create(null));
	 * // => true
	 */

	function isPlainObject$1(value) {
	  if (!isObjectLike_1(value) || _baseGetTag(value) != objectTag$5) {
	    return false;
	  }

	  var proto = _getPrototype(value);

	  if (proto === null) {
	    return true;
	  }

	  var Ctor = hasOwnProperty$i.call(proto, 'constructor') && proto.constructor;
	  return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString$5.call(Ctor) == objectCtorString$1;
	}

	var isPlainObject_1 = isPlainObject$1;

	/**
	 * Gets the value at `key`, unless `key` is "__proto__".
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function safeGet$1(object, key) {
	  if (key == '__proto__') {
	    return;
	  }

	  return object[key];
	}

	var _safeGet = safeGet$1;

	/** Used for built-in method references. */

	var objectProto$o = Object.prototype;
	/** Used to check objects for own properties. */

	var hasOwnProperty$j = objectProto$o.hasOwnProperty;
	/**
	 * Assigns `value` to `key` of `object` if the existing value is not equivalent
	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */

	function assignValue$1(object, key, value) {
	  var objValue = object[key];

	  if (!(hasOwnProperty$j.call(object, key) && eq_1(objValue, value)) || value === undefined && !(key in object)) {
	    _baseAssignValue(object, key, value);
	  }
	}

	var _assignValue = assignValue$1;

	/**
	 * Copies properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy properties from.
	 * @param {Array} props The property identifiers to copy.
	 * @param {Object} [object={}] The object to copy properties to.
	 * @param {Function} [customizer] The function to customize copied values.
	 * @returns {Object} Returns `object`.
	 */

	function copyObject$1(source, props, object, customizer) {
	  var isNew = !object;
	  object || (object = {});
	  var index = -1,
	      length = props.length;

	  while (++index < length) {
	    var key = props[index];
	    var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;

	    if (newValue === undefined) {
	      newValue = source[key];
	    }

	    if (isNew) {
	      _baseAssignValue(object, key, newValue);
	    } else {
	      _assignValue(object, key, newValue);
	    }
	  }

	  return object;
	}

	var _copyObject = copyObject$1;

	/**
	 * This function is like
	 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * except that it includes inherited enumerable properties.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function nativeKeysIn$1(object) {
	  var result = [];

	  if (object != null) {
	    for (var key in Object(object)) {
	      result.push(key);
	    }
	  }

	  return result;
	}

	var _nativeKeysIn = nativeKeysIn$1;

	/** Used for built-in method references. */

	var objectProto$p = Object.prototype;
	/** Used to check objects for own properties. */

	var hasOwnProperty$k = objectProto$p.hasOwnProperty;
	/**
	 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */

	function baseKeysIn$1(object) {
	  if (!isObject_1(object)) {
	    return _nativeKeysIn(object);
	  }

	  var isProto = _isPrototype(object),
	      result = [];

	  for (var key in object) {
	    if (!(key == 'constructor' && (isProto || !hasOwnProperty$k.call(object, key)))) {
	      result.push(key);
	    }
	  }

	  return result;
	}

	var _baseKeysIn = baseKeysIn$1;

	/**
	 * Creates an array of the own and inherited enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keysIn(new Foo);
	 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	 */

	function keysIn$1(object) {
	  return isArrayLike_1(object) ? _arrayLikeKeys(object, true) : _baseKeysIn(object);
	}

	var keysIn_1 = keysIn$1;

	/**
	 * Converts `value` to a plain object flattening inherited enumerable string
	 * keyed properties of `value` to own properties of the plain object.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {Object} Returns the converted plain object.
	 * @example
	 *
	 * function Foo() {
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.assign({ 'a': 1 }, new Foo);
	 * // => { 'a': 1, 'b': 2 }
	 *
	 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
	 * // => { 'a': 1, 'b': 2, 'c': 3 }
	 */

	function toPlainObject$1(value) {
	  return _copyObject(value, keysIn_1(value));
	}

	var toPlainObject_1 = toPlainObject$1;

	/**
	 * A specialized version of `baseMerge` for arrays and objects which performs
	 * deep merges and tracks traversed objects enabling objects with circular
	 * references to be merged.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @param {string} key The key of the value to merge.
	 * @param {number} srcIndex The index of `source`.
	 * @param {Function} mergeFunc The function to merge values.
	 * @param {Function} [customizer] The function to customize assigned values.
	 * @param {Object} [stack] Tracks traversed source values and their merged
	 *  counterparts.
	 */

	function baseMergeDeep$1(object, source, key, srcIndex, mergeFunc, customizer, stack) {
	  var objValue = _safeGet(object, key),
	      srcValue = _safeGet(source, key),
	      stacked = stack.get(srcValue);

	  if (stacked) {
	    _assignMergeValue(object, key, stacked);
	    return;
	  }

	  var newValue = customizer ? customizer(objValue, srcValue, key + '', object, source, stack) : undefined;
	  var isCommon = newValue === undefined;

	  if (isCommon) {
	    var isArr = isArray_1(srcValue),
	        isBuff = !isArr && isBuffer_1(srcValue),
	        isTyped = !isArr && !isBuff && isTypedArray_1(srcValue);
	    newValue = srcValue;

	    if (isArr || isBuff || isTyped) {
	      if (isArray_1(objValue)) {
	        newValue = objValue;
	      } else if (isArrayLikeObject_1(objValue)) {
	        newValue = _copyArray(objValue);
	      } else if (isBuff) {
	        isCommon = false;
	        newValue = _cloneBuffer(srcValue, true);
	      } else if (isTyped) {
	        isCommon = false;
	        newValue = _cloneTypedArray(srcValue, true);
	      } else {
	        newValue = [];
	      }
	    } else if (isPlainObject_1(srcValue) || isArguments_1(srcValue)) {
	      newValue = objValue;

	      if (isArguments_1(objValue)) {
	        newValue = toPlainObject_1(objValue);
	      } else if (!isObject_1(objValue) || isFunction_1(objValue)) {
	        newValue = _initCloneObject(srcValue);
	      }
	    } else {
	      isCommon = false;
	    }
	  }

	  if (isCommon) {
	    // Recursively merge objects and arrays (susceptible to call stack limits).
	    stack.set(srcValue, newValue);
	    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
	    stack['delete'](srcValue);
	  }

	  _assignMergeValue(object, key, newValue);
	}

	var _baseMergeDeep = baseMergeDeep$1;

	/**
	 * The base implementation of `_.merge` without support for multiple sources.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @param {number} srcIndex The index of `source`.
	 * @param {Function} [customizer] The function to customize merged values.
	 * @param {Object} [stack] Tracks traversed source values and their merged
	 *  counterparts.
	 */

	function baseMerge$1(object, source, srcIndex, customizer, stack) {
	  if (object === source) {
	    return;
	  }

	  _baseFor(source, function (srcValue, key) {
	    if (isObject_1(srcValue)) {
	      stack || (stack = new _Stack());
	      _baseMergeDeep(object, source, key, srcIndex, baseMerge$1, customizer, stack);
	    } else {
	      var newValue = customizer ? customizer(_safeGet(object, key), srcValue, key + '', object, source, stack) : undefined;

	      if (newValue === undefined) {
	        newValue = srcValue;
	      }

	      _assignMergeValue(object, key, newValue);
	    }
	  }, keysIn_1);
	}

	var _baseMerge = baseMerge$1;

	/**
	 * Used by `_.defaultsDeep` to customize its `_.merge` use to merge source
	 * objects into destination objects that are passed thru.
	 *
	 * @private
	 * @param {*} objValue The destination value.
	 * @param {*} srcValue The source value.
	 * @param {string} key The key of the property to merge.
	 * @param {Object} object The parent object of `objValue`.
	 * @param {Object} source The parent object of `srcValue`.
	 * @param {Object} [stack] Tracks traversed source values and their merged
	 *  counterparts.
	 * @returns {*} Returns the value to assign.
	 */

	function customDefaultsMerge$1(objValue, srcValue, key, object, source, stack) {
	  if (isObject_1(objValue) && isObject_1(srcValue)) {
	    // Recursively merge objects and arrays (susceptible to call stack limits).
	    stack.set(srcValue, objValue);
	    _baseMerge(objValue, srcValue, undefined, customDefaultsMerge$1, stack);
	    stack['delete'](srcValue);
	  }

	  return objValue;
	}

	var _customDefaultsMerge = customDefaultsMerge$1;

	/**
	 * Checks if the given arguments are from an iteratee call.
	 *
	 * @private
	 * @param {*} value The potential iteratee value argument.
	 * @param {*} index The potential iteratee index or key argument.
	 * @param {*} object The potential iteratee object argument.
	 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
	 *  else `false`.
	 */

	function isIterateeCall$1(value, index, object) {
	  if (!isObject_1(object)) {
	    return false;
	  }

	  var type = typeof index;

	  if (type == 'number' ? isArrayLike_1(object) && _isIndex(index, object.length) : type == 'string' && index in object) {
	    return eq_1(object[index], value);
	  }

	  return false;
	}

	var _isIterateeCall = isIterateeCall$1;

	/**
	 * Creates a function like `_.assign`.
	 *
	 * @private
	 * @param {Function} assigner The function to assign values.
	 * @returns {Function} Returns the new assigner function.
	 */

	function createAssigner$1(assigner) {
	  return _baseRest(function (object, sources) {
	    var index = -1,
	        length = sources.length,
	        customizer = length > 1 ? sources[length - 1] : undefined,
	        guard = length > 2 ? sources[2] : undefined;
	    customizer = assigner.length > 3 && typeof customizer == 'function' ? (length--, customizer) : undefined;

	    if (guard && _isIterateeCall(sources[0], sources[1], guard)) {
	      customizer = length < 3 ? undefined : customizer;
	      length = 1;
	    }

	    object = Object(object);

	    while (++index < length) {
	      var source = sources[index];

	      if (source) {
	        assigner(object, source, index, customizer);
	      }
	    }

	    return object;
	  });
	}

	var _createAssigner = createAssigner$1;

	/**
	 * This method is like `_.merge` except that it accepts `customizer` which
	 * is invoked to produce the merged values of the destination and source
	 * properties. If `customizer` returns `undefined`, merging is handled by the
	 * method instead. The `customizer` is invoked with six arguments:
	 * (objValue, srcValue, key, object, source, stack).
	 *
	 * **Note:** This method mutates `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} sources The source objects.
	 * @param {Function} customizer The function to customize assigned values.
	 * @returns {Object} Returns `object`.
	 * @example
	 *
	 * function customizer(objValue, srcValue) {
	 *   if (_.isArray(objValue)) {
	 *     return objValue.concat(srcValue);
	 *   }
	 * }
	 *
	 * var object = { 'a': [1], 'b': [2] };
	 * var other = { 'a': [3], 'b': [4] };
	 *
	 * _.mergeWith(object, other, customizer);
	 * // => { 'a': [1, 3], 'b': [2, 4] }
	 */

	var mergeWith$1 = _createAssigner(function (object, source, srcIndex, customizer) {
	  _baseMerge(object, source, srcIndex, customizer);
	});
	var mergeWith_1 = mergeWith$1;

	/**
	 * This method is like `_.defaults` except that it recursively assigns
	 * default properties.
	 *
	 * **Note:** This method mutates `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.10.0
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} [sources] The source objects.
	 * @returns {Object} Returns `object`.
	 * @see _.defaults
	 * @example
	 *
	 * _.defaultsDeep({ 'a': { 'b': 2 } }, { 'a': { 'b': 1, 'c': 3 } });
	 * // => { 'a': { 'b': 2, 'c': 3 } }
	 */

	var defaultsDeep$1 = _baseRest(function (args) {
	  args.push(undefined, _customDefaultsMerge);
	  return _apply(mergeWith_1, undefined, args);
	});
	var defaultsDeep_1 = defaultsDeep$1;

	var GUI =
	/*#__PURE__*/
	function (_Group) {
	  _inherits(GUI, _Group);

	  function GUI() {
	    var _this;

	    _classCallCheck(this, GUI);

	    _this = _possibleConstructorReturn(this, _getPrototypeOf(GUI).call(this));
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

	var Body =
	/*#__PURE__*/
	function (_GUI) {
	  _inherits(Body, _GUI);

	  function Body(world, css) {
	    var _this2;

	    _classCallCheck(this, Body);

	    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(Body).call(this));

	    _this2.lockToScreen = function () {
	      var c = _this2.world.camera;
	      c.getWorldDirection(_this2.vector);

	      _this2.rotation.set(c.rotation.x, c.rotation.y, c.rotation.z);

	      _this2.position.set(c.position.x + _this2.vector.x * _this2.distanceFromCamera, c.position.y + _this2.vector.y * _this2.distanceFromCamera, c.position.z + _this2.vector.z * _this2.distanceFromCamera);
	    };

	    _this2.update = function () {
	      _this2.canvas.width = _this2.css.width;
	      _this2.canvas.height = _this2.css.height;

	      var ctx = _this2.canvas.getContext("2d");

	      ctx.fillStyle = _this2.css.backgroundColor;
	      ctx.fillRect(0, 0, _this2.css.width, _this2.css.height);
	      var texture = new three.CanvasTexture(_this2.canvas);
	      texture.generateMipmaps = false;
	      texture.minFilter = three.LinearFilter;
	      texture.magFilter = three.LinearFilter;
	      var spriteMaterial = new three.SpriteMaterial({
	        map: texture,
	        color: 0xffffff
	      });

	      _this2.element.material.dispose();

	      _this2.element.material = spriteMaterial;

	      _this2.element.scale.set(_this2.css.width / 4, _this2.css.height / 4, 1);
	    };

	    _this2.world = world;
	    _this2.distanceFromCamera = 50;
	    _this2.css = defaultsDeep_1(css || {}, _this2.css);
	    _this2.canvas = document.createElement("canvas");

	    var _spriteMaterial = new three.SpriteMaterial({
	      map: _this2.canvas,
	      color: 0xffffff
	    });

	    _this2.element = new three.Sprite(_spriteMaterial);
	    _this2.vector = new three.Vector3();

	    _this2.update();

	    _this2.add(_this2.element);

	    return _this2;
	  }

	  return Body;
	}(GUI);

	var Div =
	/*#__PURE__*/
	function (_GUI2) {
	  _inherits(Div, _GUI2);

	  function Div(world, css) {
	    var _this3;

	    _classCallCheck(this, Div);

	    _this3 = _possibleConstructorReturn(this, _getPrototypeOf(Div).call(this));

	    _this3.update = function () {
	      _this3.canvas.width = _this3.css.width;
	      _this3.canvas.height = _this3.css.height;

	      var ctx = _this3.canvas.getContext("2d");

	      ctx.fillStyle = _this3.css.backgroundColor;
	      ctx.fillRect(0, 0, _this3.css.width, _this3.css.height);
	      var texture = new three.CanvasTexture(_this3.canvas);
	      texture.generateMipmaps = false;
	      texture.minFilter = three.LinearFilter;
	      texture.magFilter = three.LinearFilter;
	      var spriteMaterial = new three.SpriteMaterial({
	        map: texture,
	        color: 0xffffff
	      });

	      _this3.element.material.dispose();

	      _this3.element.material = spriteMaterial;

	      _this3.element.scale.set(_this3.css.width / 4, _this3.css.height / 4, 1);
	    };

	    _this3.world = world;
	    _this3.css = defaultsDeep_1(css || {}, _this3.css);
	    _this3.canvas = document.createElement("canvas");

	    var _spriteMaterial2 = new three.SpriteMaterial({
	      map: _this3.canvas,
	      color: 0xffffff
	    });

	    _this3.element = new three.Sprite(_spriteMaterial2);
	    _this3.vector = new three.Vector3();

	    _this3.update();

	    _this3.add(_this3.element);

	    return _this3;
	  }

	  return Div;
	}(GUI);

	var Txt =
	/*#__PURE__*/
	function (_Mesh) {
	  _inherits(Txt, _Mesh);

	  function Txt(text, css) {
	    var _this4;

	    _classCallCheck(this, Txt);

	    css = defaultsDeep_1(css || {}, {
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
	    _this4 = _possibleConstructorReturn(this, _getPrototypeOf(Txt).call(this, new three.PlaneBufferGeometry(css.width / 8, css.height / 8), material));

	    _this4.update = function () {
	      var _this4$material$map;

	      (_this4$material$map = _this4.material.map) === null || _this4$material$map === void 0 ? void 0 : _this4$material$map.dispose();
	      _this4.canvas.width = _this4.css.width;
	      _this4.canvas.height = _this4.css.height;

	      var ctx = _this4.canvas.getContext("2d");

	      ctx.fillStyle = _this4.css.backgroundColor;
	      ctx.fillRect(0, 0, _this4.css.width, _this4.css.height);
	      ctx.textAlign = _this4.css.textAlign;
	      ctx.font = _this4.css.fontStyle + " " + _this4.css.fontVariant + " " + _this4.css.fontWeight + " " + _this4.css.fontSize + "px " + _this4.css.fontFamily;
	      ctx.fillStyle = _this4.css.color; // let width = ctx.measureText( this.text ).width;

	      ctx.fillText(_this4.text, _this4.css.width / 2, _this4.css.height / 2 + _this4.css.fontSize / 4);
	      var texture = new three.CanvasTexture(_this4.canvas);
	      texture.generateMipmaps = false;
	      texture.minFilter = three.LinearFilter;
	      texture.magFilter = three.LinearFilter;
	      _this4.material.map = texture;

	      _this4.scale.set(_this4.css.scale.x, _this4.css.scale.y, _this4.css.scale.z);

	      _this4.material.opacity = _this4.css.opacity;
	    };

	    _this4.text = text;
	    _this4.canvas = canvas;
	    _this4.css = css;

	    _this4.update();

	    return _this4;
	  }

	  return Txt;
	}(three.Mesh); //$$.Img = function(url, css, callback) {

	var LoaderFactory =
	/*#__PURE__*/
	function () {
	  function LoaderFactory() {
	    var _this = this;

	    _classCallCheck(this, LoaderFactory);

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

	  _createClass(LoaderFactory, [{
	    key: "loadImage",
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
	    key: "loadTexture",
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
	    'tDiffuse': {
	      value: null
	    },
	    'opacity': {
	      value: 1.0
	    }
	  },
	  vertexShader: "\n    varying vec2 vUv;\n    void main() {\n      vUv = uv;\n      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n    }",
	  fragmentShader: "\n    uniform float opacity;\n    uniform sampler2D tDiffuse;\n    varying vec2 vUv;\n    void main() {\n      vec4 texel = texture2D( tDiffuse, vUv );\n      gl_FragColor = opacity * texel;\n    }"
	};

	var Pass =
	/*#__PURE__*/
	function () {
	  function Pass(effectComposer) {
	    var renderToScreen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	    _classCallCheck(this, Pass);

	    // if set to true, the pass is processed by the composer
	    this.enabled = true; // if set to true, the pass indicates to swap read and write buffer after rendering

	    this.needsSwap = true; // if set to true, the pass clears its buffer before rendering

	    this.clear = false; // if set to true, the result of the pass is rendered to screen

	    this.renderToScreen = renderToScreen;

	    if (effectComposer) {
	      effectComposer.addPass(this);
	    }
	  }

	  _createClass(Pass, [{
	    key: "setSize",
	    value: function setSize() {} // width, height

	  }, {
	    key: "render",
	    value: function render() {} // renderer, writeBuffer, readBuffer, delta, maskActive

	  }]);

	  return Pass;
	}();

	var ShaderPass =
	/*#__PURE__*/
	function (_Pass) {
	  _inherits(ShaderPass, _Pass);

	  function ShaderPass(shader, effectComposer) {
	    var _this;

	    var renderToScreen = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
	    var textureID = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "tDiffuse";

	    _classCallCheck(this, ShaderPass);

	    _this = _possibleConstructorReturn(this, _getPrototypeOf(ShaderPass).call(this, effectComposer, renderToScreen));
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

	  _createClass(ShaderPass, [{
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

	var RenderPass =
	/*#__PURE__*/
	function (_Pass) {
	  _inherits(RenderPass, _Pass);

	  function RenderPass(scene, camera, overrideMaterial, clearColor) {
	    var _this;

	    var clearAlpha = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

	    _classCallCheck(this, RenderPass);

	    _this = _possibleConstructorReturn(this, _getPrototypeOf(RenderPass).call(this));
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

	  _createClass(RenderPass, [{
	    key: "render",
	    value: function render(renderer, writeBuffer, readBuffer) {
	      var oldAutoClear = renderer.autoClear;
	      renderer.autoClear = false;
	      this.scene.overrideMaterial = this.overrideMaterial;
	      this.writeBuffer = writeBuffer;
	      var oldClearColor, oldClearAlpha;

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

	var MaskPass =
	/*#__PURE__*/
	function (_Pass) {
	  _inherits(MaskPass, _Pass);

	  function MaskPass(scene, camera) {
	    var _this;

	    _classCallCheck(this, MaskPass);

	    _this = _possibleConstructorReturn(this, _getPrototypeOf(MaskPass).call(this));
	    _this.scene = scene;
	    _this.camera = camera;
	    _this.clear = true;
	    _this.needsSwap = false;
	    _this.inverse = false;
	    return _this;
	  }

	  _createClass(MaskPass, [{
	    key: "render",
	    value: function render(renderer, writeBuffer, readBuffer) {
	      var context = renderer.context;
	      var state = renderer.state; // don't update color or depth

	      state.buffers.color.setMask(false);
	      state.buffers.depth.setMask(false); // lock buffers

	      state.buffers.color.setLocked(true);
	      state.buffers.depth.setLocked(true); // set up stencil

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
	      state.buffers.stencil.setClear(clearValue); // draw into the stencil buffer

	      renderer.render(this.scene, this.camera, readBuffer, this.clear);
	      renderer.render(this.scene, this.camera, writeBuffer, this.clear); // unlock color and depth buffer for subsequent rendering

	      state.buffers.color.setLocked(false);
	      state.buffers.depth.setLocked(false); // only render where stencil is set to 1

	      state.buffers.stencil.setFunc(context.EQUAL, 1, 0xffffffff); // draw if == 1

	      state.buffers.stencil.setOp(context.KEEP, context.KEEP, context.KEEP);
	    }
	  }]);

	  return MaskPass;
	}(Pass);

	var ClearMaskPass =
	/*#__PURE__*/
	function (_Pass) {
	  _inherits(ClearMaskPass, _Pass);

	  function ClearMaskPass() {
	    var _this;

	    _classCallCheck(this, ClearMaskPass);

	    _this = _possibleConstructorReturn(this, _getPrototypeOf(ClearMaskPass).call(this));
	    _this.needsSwap = false;
	    return _this;
	  }

	  _createClass(ClearMaskPass, [{
	    key: "render",
	    value: function render(renderer) {
	      renderer.state.buffers.stencil.setTest(false);
	    }
	  }]);

	  return ClearMaskPass;
	}(Pass);

	var EffectComposer =
	/*#__PURE__*/
	function () {
	  function EffectComposer(world) {
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	    var renderTarget = arguments.length > 2 ? arguments[2] : undefined;

	    _classCallCheck(this, EffectComposer);

	    options = _objectSpread({
	      renderer: undefined,
	      camera: undefined,
	      scene: undefined,
	      overrideMaterial: undefined,
	      clearColor: undefined,
	      clearAlpha: 0
	    }, options);
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

	  _createClass(EffectComposer, [{
	    key: "swapBuffers",
	    value: function swapBuffers() {
	      var tmp = this.readBuffer;
	      this.readBuffer = this.writeBuffer;
	      this.writeBuffer = tmp;
	    }
	  }, {
	    key: "addPass",
	    value: function addPass(pass) {
	      this.passes.push(pass);
	      var size = this.renderer.getDrawingBufferSize();
	      pass.setSize(size.width, size.height);
	    }
	  }, {
	    key: "insertPass",
	    value: function insertPass(pass, index) {
	      this.passes.splice(index, 0, pass);
	    }
	  }, {
	    key: "render",
	    value: function render(delta) {
	      var maskActive = false;
	      var pass,
	          i,
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
	    key: "reset",
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
	    key: "setSize",
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
	    "damp": {
	      value: 0.96
	    },
	    "tOld": {
	      value: null
	    },
	    "tNew": {
	      value: null
	    }
	  },
	  vertexShader: "\n    varying vec2 vUv;\n    void main() {\n      vUv = uv;\n      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n    }",
	  fragmentShader: "\n    uniform sampler2D tOld;\n    uniform sampler2D tNew;\n    uniform float damp;\n\n    varying vec2 vUv;\n\n    vec4 when_gt( vec4 texel, float y ) {\n      return max( sign( texel - y ), 0. );\n    }\n\n    void main() {\n      vec4 texelOld = texture2D( tOld, vUv );\n      vec4 texelNew = texture2D( tNew, vUv );\n\n      texelOld *= damp * when_gt( texelOld, 0.1 );\n\n      gl_FragColor = max( texelNew, texelOld );\n    }"
	};

	var AfterimagePass =
	/*#__PURE__*/
	function (_Pass) {
	  _inherits(AfterimagePass, _Pass);

	  function AfterimagePass() {
	    var _this;

	    var damp = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0.96;
	    var effectComposer = arguments.length > 1 ? arguments[1] : undefined;
	    var renderToScreen = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	    _classCallCheck(this, AfterimagePass);

	    _this = _possibleConstructorReturn(this, _getPrototypeOf(AfterimagePass).call(this, effectComposer, renderToScreen));
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

	    var material = new three.MeshBasicMaterial({
	      map: _this.textureComp.texture
	    });
	    var quadScreen = new three.Mesh(geometry, material);

	    _this.sceneScreen.add(quadScreen);

	    return _this;
	  }

	  _createClass(AfterimagePass, [{
	    key: "render",
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
	    "tDiffuse": {
	      value: null
	    },
	    "tSize": {
	      value: new three.Vector2(256, 256)
	    },
	    "center": {
	      value: new three.Vector2(0.5, 0.5)
	    },
	    "angle": {
	      value: 1.57
	    },
	    "scale": {
	      value: 1.0
	    }
	  },
	  vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
	  fragmentShader: ["uniform vec2 center;", "uniform float angle;", "uniform float scale;", "uniform vec2 tSize;", "uniform sampler2D tDiffuse;", "varying vec2 vUv;", "float pattern() {", "float s = sin( angle ), c = cos( angle );", "vec2 tex = vUv * tSize - center;", "vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;", "return ( sin( point.x ) * sin( point.y ) ) * 4.0;", "}", "void main() {", "vec4 color = texture2D( tDiffuse, vUv );", "float average = ( color.r + color.g + color.b ) / 3.0;", "gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );", "}"].join("\n")
	};

	var DotScreenPass =
	/*#__PURE__*/
	function (_Pass) {
	  _inherits(DotScreenPass, _Pass);

	  function DotScreenPass(center, angle, scale, effectComposer) {
	    var _this;

	    var renderToScreen = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

	    _classCallCheck(this, DotScreenPass);

	    _this = _possibleConstructorReturn(this, _getPrototypeOf(DotScreenPass).call(this, effectComposer, renderToScreen));
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

	  _createClass(DotScreenPass, [{
	    key: "render",
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
	    "tDiffuse": {
	      value: null
	    },
	    //diffuse texture
	    "tDisp": {
	      value: null
	    },
	    //displacement texture for digital glitch squares
	    "byp": {
	      value: 0
	    },
	    //apply the glitch ?
	    "amount": {
	      value: 0.08
	    },
	    "angle": {
	      value: 0.02
	    },
	    "seed": {
	      value: 0.02
	    },
	    "seed_x": {
	      value: 0.02
	    },
	    //-1,1
	    "seed_y": {
	      value: 0.02
	    },
	    //-1,1
	    "distortion_x": {
	      value: 0.5
	    },
	    "distortion_y": {
	      value: 0.6
	    },
	    "col_s": {
	      value: 0.05
	    }
	  },
	  vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
	  fragmentShader: ["uniform int byp;", //should we apply the glitch ?
	  "uniform sampler2D tDiffuse;", "uniform sampler2D tDisp;", "uniform float amount;", "uniform float angle;", "uniform float seed;", "uniform float seed_x;", "uniform float seed_y;", "uniform float distortion_x;", "uniform float distortion_y;", "uniform float col_s;", "varying vec2 vUv;", "float rand(vec2 co){", "return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);", "}", "void main() {", "if(byp<1) {", "vec2 p = vUv;", "float xs = floor(gl_FragCoord.x / 0.5);", "float ys = floor(gl_FragCoord.y / 0.5);", //based on staffantans glitch shader for unity https://github.com/staffantan/unityglitch
	  "vec4 normal = texture2D (tDisp, p*seed*seed);", "if(p.y<distortion_x+col_s && p.y>distortion_x-col_s*seed) {", "if(seed_x>0.){", "p.y = 1. - (p.y + distortion_y);", "}", "else {", "p.y = distortion_y;", "}", "}", "if(p.x<distortion_y+col_s && p.x>distortion_y-col_s*seed) {", "if(seed_y>0.){", "p.x=distortion_x;", "}", "else {", "p.x = 1. - (p.x + distortion_x);", "}", "}", "p.x+=normal.x*seed_x*(seed/5.);", "p.y+=normal.y*seed_y*(seed/5.);", //base from RGB shift shader
	  "vec2 offset = amount * vec2( cos(angle), sin(angle));", "vec4 cr = texture2D(tDiffuse, p + offset);", "vec4 cga = texture2D(tDiffuse, p);", "vec4 cb = texture2D(tDiffuse, p - offset);", "gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);", //add noise
	  "vec4 snow = 200.*amount*vec4(rand(vec2(xs * seed,ys * seed*50.))*0.2);", "gl_FragColor = gl_FragColor+ snow;", "}", "else {", "gl_FragColor=texture2D (tDiffuse, vUv);", "}", "}"].join("\n")
	};

	var GlitchPass =
	/*#__PURE__*/
	function (_Pass) {
	  _inherits(GlitchPass, _Pass);

	  function GlitchPass() {
	    var _this;

	    var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 64;
	    var goWild = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
	    var effectComposer = arguments.length > 2 ? arguments[2] : undefined;
	    var renderToScreen = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

	    _classCallCheck(this, GlitchPass);

	    _this = _possibleConstructorReturn(this, _getPrototypeOf(GlitchPass).call(this, effectComposer, renderToScreen));
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

	  _createClass(GlitchPass, [{
	    key: "render",
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
	    key: "generateTrigger",
	    value: function generateTrigger() {
	      this.randX = three.Math.randInt(120, 240);
	    }
	  }, {
	    key: "generateHeightmap",
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

	var OutlinePass =
	/*#__PURE__*/
	function (_Pass) {
	  _inherits(OutlinePass, _Pass);

	  function OutlinePass(resolution, world) {
	    var _this;

	    var selectedObjects = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
	    var effectComposer = arguments.length > 3 ? arguments[3] : undefined;

	    _classCallCheck(this, OutlinePass);

	    _this = _possibleConstructorReturn(this, _getPrototypeOf(OutlinePass).call(this, undefined, false));
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
	    _this.maskBufferMaterial = new three.MeshBasicMaterial({
	      color: 0xffffff
	    });
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
	    _this.separableBlurMaterial2.uniforms["kernelRadius"].value = MAX_EDGE_GLOW; // Overlay material

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
	      effectComposer.addPass(_assertThisInitialized(_assertThisInitialized(_this)));
	    }

	    return _this;
	  }

	  _createClass(OutlinePass, [{
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
	      renderer.setClearColor(0xffffff, 1); // Make selected objects invisible

	      this.changeVisibilityOfSelectedObjects(false);
	      var currentBackground = this.renderScene.background;
	      this.renderScene.background = null; // 1. Draw Non Selected objects in the depth buffer

	      this.renderScene.overrideMaterial = this.depthMaterial;
	      renderer.render(this.renderScene, this.renderCamera, this.renderTargetDepthBuffer, true); // Make selected objects visible

	      this.changeVisibilityOfSelectedObjects(true); // Update Texture Matrix for Depth compare

	      this.updateTextureMatrix(); // Make non selected objects invisible, and draw only the selected objects, by comparing the depth buffer of non selected objects

	      this.changeVisibilityOfNonSelectedObjects(false);
	      this.renderScene.overrideMaterial = this.prepareMaskMaterial;
	      this.prepareMaskMaterial.uniforms["cameraNearFar"].value = new three.Vector2(this.renderCamera.near, this.renderCamera.far);
	      this.prepareMaskMaterial.uniforms["depthTexture"].value = this.renderTargetDepthBuffer.texture;
	      this.prepareMaskMaterial.uniforms["textureMatrix"].value = this.textureMatrix;
	      renderer.render(this.renderScene, this.renderCamera, this.renderTargetMaskBuffer, true);
	      this.renderScene.overrideMaterial = null;
	      this.changeVisibilityOfNonSelectedObjects(true);
	      this.renderScene.background = currentBackground; // 2. Downsample to Half resolution

	      this.quad.material = this.materialCopy;
	      this.copyUniforms["tDiffuse"].value = this.renderTargetMaskBuffer.texture;
	      renderer.render(this.scene, this.camera, this.renderTargetMaskDownSampleBuffer, true);
	      this.tempPulseColor1.copy(this.visibleEdgeColor);
	      this.tempPulseColor2.copy(this.hiddenEdgeColor);

	      if (this.pulsePeriod > 0) {
	        var scalar = (1 + 0.25) / 2 + Math.cos(performance.now() * 0.01 / this.pulsePeriod) * (1.0 - 0.25) / 2;
	        this.tempPulseColor1.multiplyScalar(scalar);
	        this.tempPulseColor2.multiplyScalar(scalar);
	      } // 3. Apply Edge Detection Pass


	      this.quad.material = this.edgeDetectionMaterial;
	      this.edgeDetectionMaterial.uniforms["maskTexture"].value = this.renderTargetMaskDownSampleBuffer.texture;
	      this.edgeDetectionMaterial.uniforms["texSize"].value = new three.Vector2(this.renderTargetMaskDownSampleBuffer.width, this.renderTargetMaskDownSampleBuffer.height);
	      this.edgeDetectionMaterial.uniforms["visibleEdgeColor"].value = this.tempPulseColor1;
	      this.edgeDetectionMaterial.uniforms["hiddenEdgeColor"].value = this.tempPulseColor2;
	      renderer.render(this.scene, this.camera, this.renderTargetEdgeBuffer1, true); // 4. Apply Blur on Half res

	      this.quad.material = this.separableBlurMaterial1;
	      this.separableBlurMaterial1.uniforms["colorTexture"].value = this.renderTargetEdgeBuffer1.texture;
	      this.separableBlurMaterial1.uniforms["direction"].value = this.BlurDirectionX;
	      this.separableBlurMaterial1.uniforms["kernelRadius"].value = this.edgeThickness;
	      renderer.render(this.scene, this.camera, this.renderTargetBlurBuffer1, true);
	      this.separableBlurMaterial1.uniforms["colorTexture"].value = this.renderTargetBlurBuffer1.texture;
	      this.separableBlurMaterial1.uniforms["direction"].value = this.BlurDirectionY;
	      renderer.render(this.scene, this.camera, this.renderTargetEdgeBuffer1, true); // Apply Blur on quarter res

	      this.quad.material = this.separableBlurMaterial2;
	      this.separableBlurMaterial2.uniforms["colorTexture"].value = this.renderTargetEdgeBuffer1.texture;
	      this.separableBlurMaterial2.uniforms["direction"].value = this.BlurDirectionX;
	      renderer.render(this.scene, this.camera, this.renderTargetBlurBuffer2, true);
	      this.separableBlurMaterial2.uniforms["colorTexture"].value = this.renderTargetBlurBuffer2.texture;
	      this.separableBlurMaterial2.uniforms["direction"].value = this.BlurDirectionY;
	      renderer.render(this.scene, this.camera, this.renderTargetEdgeBuffer2, true); // Blend it additively over the input texture

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
	          "depthTexture": {
	            value: null
	          },
	          "cameraNearFar": {
	            value: new three.Vector2(0.5, 0.5)
	          },
	          "textureMatrix": {
	            value: new three.Matrix4()
	          }
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
	          "maskTexture": {
	            value: null
	          },
	          "texSize": {
	            value: new three.Vector2(0.5, 0.5)
	          },
	          "visibleEdgeColor": {
	            value: new three.Vector3(1.0, 1.0, 1.0)
	          },
	          "hiddenEdgeColor": {
	            value: new three.Vector3(1.0, 1.0, 1.0)
	          }
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
	          "colorTexture": {
	            value: null
	          },
	          "texSize": {
	            value: new three.Vector2(0.5, 0.5)
	          },
	          "direction": {
	            value: new three.Vector2(0.5, 0.5)
	          },
	          "kernelRadius": {
	            value: 1.0
	          }
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
	          "maskTexture": {
	            value: null
	          },
	          "edgeTexture1": {
	            value: null
	          },
	          "edgeTexture2": {
	            value: null
	          },
	          "patternTexture": {
	            value: null
	          },
	          "edgeStrength": {
	            value: 1.0
	          },
	          "edgeGlow": {
	            value: 1.0
	          },
	          "usePatternTexture": {
	            value: 0.0
	          }
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
	    "tDiffuse": {
	      type: "t",
	      value: null
	    },
	    // diffuse texture
	    "tPaper": {
	      type: "t",
	      value: null
	    },
	    // paper texture
	    "texel": {
	      type: "v2",
	      value: new three.Vector2(1.0 / 512, 1.0 / 512)
	    },
	    "scale": {
	      type: "f",
	      value: 0.03
	    },
	    // wobble scale
	    "threshold": {
	      type: "f",
	      value: 0.7
	    },
	    // edge threshold
	    "darkening": {
	      type: "f",
	      value: 1.75
	    },
	    // edge darkening
	    "pigment": {
	      type: "f",
	      value: 1.2
	    } // pigment dispersion

	  },
	  vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
	  fragmentShader: ["uniform sampler2D tDiffuse;", "uniform sampler2D tPaper;", "uniform vec2 texel;", "uniform float scale;", "uniform float threshold;", "uniform float darkening;", "uniform float pigment;", "varying vec2 vUv;", "float sobel(sampler2D tex, vec2 uv) {", "vec3 hr = vec3(0., 0., 0.);", "hr += texture2D(tex, (uv + vec2(-1.0, -1.0) * texel)).rgb *  1.0;", "hr += texture2D(tex, (uv + vec2( 0.0, -1.0) * texel)).rgb *  0.0;", "hr += texture2D(tex, (uv + vec2( 1.0, -1.0) * texel)).rgb * -1.0;", "hr += texture2D(tex, (uv + vec2(-1.0,  0.0) * texel)).rgb *  2.0;", "hr += texture2D(tex, (uv + vec2( 0.0,  0.0) * texel)).rgb *  0.0;", "hr += texture2D(tex, (uv + vec2( 1.0,  0.0) * texel)).rgb * -2.0;", "hr += texture2D(tex, (uv + vec2(-1.0,  1.0) * texel)).rgb *  1.0;", "hr += texture2D(tex, (uv + vec2( 0.0,  1.0) * texel)).rgb *  0.0;", "hr += texture2D(tex, (uv + vec2( 1.0,  1.0) * texel)).rgb * -1.0;", "vec3 vt = vec3(0., 0., 0.);", "vt += texture2D(tex, (uv + vec2(-1.0, -1.0) * texel)).rgb *  1.0;", "vt += texture2D(tex, (uv + vec2( 0.0, -1.0) * texel)).rgb *  2.0;", "vt += texture2D(tex, (uv + vec2( 1.0, -1.0) * texel)).rgb *  1.0;", "vt += texture2D(tex, (uv + vec2(-1.0,  0.0) * texel)).rgb *  0.0;", "vt += texture2D(tex, (uv + vec2( 0.0,  0.0) * texel)).rgb *  0.0;", "vt += texture2D(tex, (uv + vec2( 1.0,  0.0) * texel)).rgb *  0.0;", "vt += texture2D(tex, (uv + vec2(-1.0,  1.0) * texel)).rgb * -1.0;", "vt += texture2D(tex, (uv + vec2( 0.0,  1.0) * texel)).rgb * -2.0;", "vt += texture2D(tex, (uv + vec2( 1.0,  1.0) * texel)).rgb * -1.0;", "return sqrt(dot(hr, hr) + dot(vt, vt));", "}", "vec2 wobble(sampler2D tex, vec2 uv) {", "return uv + (texture2D(tex, uv).xy - 0.5) * scale;", "}", "vec4 edgeDarkening(sampler2D tex, vec2 uv) {", "vec4 c = texture2D(tex, uv);", "return c * (1.0 - (1.0 - c) * (darkening - 1.0));", "}", "float granulation(sampler2D tex, vec2 uv, float beta) {", "vec4 c = texture2D(tex, uv);", "float intensity = (c.r + c.g + c.b) / 3.0;", "return 1.0 + beta * (intensity - 0.5);", "}", "void main() {", "vec2 uv = vUv;", "uv = wobble(tPaper, uv);", "float pd = granulation(tPaper, vUv, pigment);", // pigment dispersion
	  "float edge = sobel(tDiffuse, uv);", "if (edge > threshold) {", "gl_FragColor = pd * edgeDarkening(tDiffuse, uv);", "} else {", "gl_FragColor = pd * texture2D(tDiffuse, uv);", "}", "}"].join("\n")
	};

	var WatercolorPass =
	/*#__PURE__*/
	function (_Pass) {
	  _inherits(WatercolorPass, _Pass);

	  function WatercolorPass(tPaper, effectComposer, renderToScreen) {
	    var _this;

	    _classCallCheck(this, WatercolorPass);

	    _this = _possibleConstructorReturn(this, _getPrototypeOf(WatercolorPass).call(this, effectComposer, renderToScreen));
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

	  _createClass(WatercolorPass, [{
	    key: "render",
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
	    "tDiffuse": {
	      value: null
	    },
	    "tSize": {
	      value: new three.Vector2(256, 256)
	    },
	    "center": {
	      value: new three.Vector2(0.5, 0.5)
	    },
	    "angle": {
	      value: 1.57
	    },
	    "scale": {
	      value: 1.0
	    }
	  },
	  vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
	  fragmentShader: ["uniform vec2 center;\n    uniform float angle;\n    uniform float scale;\n    uniform vec2 tSize;\n    uniform sampler2D tDiffuse;\n    varying vec2 vUv;\n    float pattern() {\n      float s = sin( angle ), c = cos( angle );\n      vec2 tex = vUv * tSize - center;\n      vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;\n      return ( sin( point.x ) * sin( point.y ) ) * 4.0;\n    }\n\nconst float PI = 3.1415926536;\nconst float PI2 = PI * 2.0; \nconst int mSize = 9;\nconst int kSize = (mSize-1)/2;\nconst float sigma = 3.0;\nfloat kernel[mSize];\n\nfloat normpdf(in float x, in float sigma) \n{\n\treturn 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;\n}\n\nvec3 colorDodge(in vec3 src, in vec3 dst)\n{\n    return step(0.0, dst) * mix(min(vec3(1.0), dst/ (1.0 - src)), vec3(1.0), step(1.0, src)); \n}\n\nfloat greyScale(in vec3 col) \n{\n    return dot(col, vec3(0.3, 0.59, 0.11));\n    //return dot(col, vec3(0.2126, 0.7152, 0.0722)); //sRGB\n}\n\nvec2 random(vec2 p){\n\tp = fract(p * vec2(443.897, 441.423));\n    p += dot(p, p.yx+19.19);\n    return fract((p.xx+p.yx)*p.xy);\n}\n\n\n    void main() {\n    \tvec2 q = -1.0 + 2.0 *vUv;\n      vec4 color = texture2D( tDiffuse, vUv );\n      vec3 col = color.rgb;\n      \n      vec2 r = random(q);\n      r.x *= PI2;\n      vec2 cr = vec2(sin(r.x),cos(r.x))*sqrt(r.y);\n    \n      vec3 blurred = color.rgb;\n    \n    \n    vec3 inv = vec3(1.0) - blurred; \n    // color dodge\n    vec3 lighten = colorDodge(col, inv);\n    // grey scale\n    vec3 res = vec3(greyScale(lighten));\n    \n    // more contrast\n    res = vec3(pow(res.x, 3.0)); \n      \n      \n      gl_FragColor = vec4( res,1.0 );\n    }"].join("\n")
	};

	var TestPass =
	/*#__PURE__*/
	function (_Pass) {
	  _inherits(TestPass, _Pass);

	  function TestPass(center, angle, scale, effectComposer) {
	    var _this;

	    var renderToScreen = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

	    _classCallCheck(this, TestPass);

	    _this = _possibleConstructorReturn(this, _getPrototypeOf(TestPass).call(this, effectComposer, renderToScreen));
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

	  _createClass(TestPass, [{
	    key: "render",
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
	    "tDiffuse": {
	      value: null
	    },
	    "resolution": {
	      value: new three.Vector2(1 / 1024, 1 / 512)
	    }
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
	exports.Transitioner = Transitioner;
	exports.View = View;
	exports.VR = VR;
	exports.World = World;
	exports.NotFunctionError = NotFunctionError;
	exports.EventManager = EventManager;
	exports.Events = Events;
	exports.FBOEventMapper = FBOEventMapper;
	exports.Signal = Signal;
	exports.LoaderFactory = LoaderFactory;
	exports.EffectComposer = EffectComposer;
	exports.QRCode = QRCode;
	exports.GUI = GUI;
	exports.Body = Body;
	exports.Txt = Txt;
	exports.Div = Div;
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
