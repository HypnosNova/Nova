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

export {
  LoaderFactory
};