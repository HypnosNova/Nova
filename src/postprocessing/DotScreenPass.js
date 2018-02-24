import { Pass } from './Pass.js';
import { DotScreenShader } from './shader/DotScreenShader.js';

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

export {
  DotScreenPass
};