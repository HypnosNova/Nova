//import * as THREE from './../three.module.js';
let LoaderFactory = class {
  constructor() {
    let manager = new THREE.LoadingManager();
    let that = this;

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

    manager.onStart = function(url, itemsLoaded, itemsTotal) {
      if (that.onStart && typeof that.onStart === 'function') {
        that.onStart(url, itemsLoaded, itemsTotal);
      }
    };

    manager.onLoad = function() {
      if (that.onLoad && typeof that.onLoad === 'function') {
        that.onLoad();
      }
    };

    manager.onProgress = function(url, itemsLoaded, itemsTotal) {
      if (that.onProgress && typeof that.onProgress === 'function') {
        that.onProgress(url, itemsLoaded, itemsTotal);
      }
    };

    manager.onError = function(url) {
      if (that.onError && typeof that.onError === 'function') {
        that.onError(url);
      }
    };

    this.imageLoader = new THREE.ImageLoader(manager);
    this.textureLoader = new THREE.TextureLoader(manager);
    this.audioListener = new THREE.AudioListener(manager);
  }

  loadImage(key, src) {
    let load = (src) => {
      this.imageLoaderloader.load(src,
        (data) => {
          this.Resource.images[key] = data;
        }, undefined, (err) => {
          this.Resource.unloaded.images.push(src);
        }
      );
    }
  }
};

export {
  LoaderFactory
};