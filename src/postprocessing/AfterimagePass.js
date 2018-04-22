import { Pass } from './Pass.js';
import { AfterimageShader } from './shader/AfterimageShader.js';

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

export {
  AfterimagePass
};