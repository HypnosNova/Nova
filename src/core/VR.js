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

export {
  VR
};