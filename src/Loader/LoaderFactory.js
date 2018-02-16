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

export {
  LoaderFactory
};