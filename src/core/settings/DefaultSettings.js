//适合大部分WebGL的APP设置
export default {
	parent: document.body, //APP所在DOM容器
	setCommonCSS: true, //设置默认CSS样式，无法滚动，超出区域不显示，取消所有内外边距
	autoStart: true, //自动执行渲染循环和逻辑循环
	autoResize: true, //自动拉伸自适应不同屏幕分辨率
	VRSupport: false, //是否加载VR支持模块
	renderer: {
		canvas: undefined,
		clearColor: 0x000000, //渲染器的默认清除颜色
		clearAlpha: 1, //渲染器的默认清除颜色的透明度
		pixelRatio: window.devicePixelRatio || 1, //用于移动平台的清晰度
		precision: "highp", // 渲染精细度，默认为高
		antialias: true, //是否开启抗锯齿
		alpha: false, // 渲染器是否保存alpha缓冲
		logarithmicDepthBuffer: false, // 逻辑深度缓冲
		preserveDrawingBuffer: false
	},
	normalEventList: [ "click", "mousedown", "mouseup", "touchstart", "touchend" ], //默认开启的原生事件监听，不建议将所有的事件监听都写在里面，每一个事件监听都会增加一次射线法碰撞检测，如果不必要的事件过多会降低性能
	hammerEventList: "press tap pressup pan swipe", //默认hammer手势事件的监听，同normalEventList一样，用到什么加入什么，不要一大堆东西全塞进去
};
