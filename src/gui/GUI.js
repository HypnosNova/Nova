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

//$$.Img = function(url, css, callback) {
//$$.DOM.call(this);
//var that = this;
//if ($$.Loader.RESOURCE.textures[url]) {
//  var spriteMaterial = new THREE.SpriteMaterial({
//    map: $$.Loader.RESOURCE.textures[url],
//    color: 0xffffff
//  });
//  var sprite = new THREE.Sprite(spriteMaterial);
//  that.element = sprite;
//  that.add(that.element);
//  this.css = $$.extends({}, [this.css, {
//    width: $$.Loader.RESOURCE.textures[url].image.naturalWidth,
//    height: $$.Loader.RESOURCE.textures[url].image.naturalHeight
//  }, css]);
//  sprite.scale.set(this.css.width / 4, this.css.height / 4, 1);
//  sprite.material.opacity = that.css.opacity;
//  if (callback) {
//    callback();
//  }
//} else {
//  that.element = {};
//  $$.Loader.loadTexture([url], function(texture) {
//    texture.generateMipmaps = false;
//    texture.minFilter = THREE.LinearFilter;
//    texture.magFilter = THREE.LinearFilter;
//    var tmpProperty = that.element;
//    var spriteMaterial = new THREE.SpriteMaterial({
//      map: texture,
//      color: 0xffffff
//    });
//    var sprite = new THREE.Sprite(spriteMaterial);
//    that.element = sprite;
//    that.add(that.element);
//    this.css = $$.extends({}, [this.css, {
//      width: texture.image.naturalWidth,
//      height: texture.image.naturalHeight
//    }, css]);
//    if (css.opacity != null) {
//      that.css.opacity = css.opacity;
//    }
//    sprite.scale.set(this.css.width / 4, this.css.height / 4, 1);
//
//    for (var i in tmpProperty) {
//      that.element[i] = tmpProperty[i];
//    }
//    sprite.material.opacity = that.css.opacity;
//    if (callback) {
//      callback();
//    }
//  });
//}
//};
//(function() {
//var Super = function() {};
//Super.prototype = $$.DOM.prototype;
//$$.Img.prototype = new Super();
//})();
//
//$$.Video = function(url, css) {
//$$.DOM.call(this);
//var that = this;
//this.video = document.createElement("video");
//this.video.src = url;
//var texture = new THREE.VideoTexture(this.video);
//texture.generateMipmaps = false;
//texture.minFilter = THREE.LinearFilter;
//texture.magFilter = THREE.LinearFilter;
//var spriteMaterial = new THREE.SpriteMaterial({
//  map: texture,
//  color: 0xffffff
//});
//var sprite = new THREE.Sprite(spriteMaterial);
//that.element = sprite;
//that.add(that.element);
//this.css = $$.extends({}, [this.css, {
//  width: texture.image.naturalWidth,
//  height: texture.image.naturalHeight,
//}, css]);
//sprite.scale.set(this.css.width / 4, this.css.height / 4, 1);
//};
//(function() {
//var Super = function() {};
//Super.prototype = $$.DOM.prototype;
//$$.Video.prototype = new Super();
//})();

export {
  GUI,
  Body,
  Txt,
  Div
};