let GhostImageShader = {
  uniforms: {
    "damp": { value: 0.96 }
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,

  fragmentShader: `
    uniform sampler2D tOld;
    uniform sampler2D tNew;
    uniform float damp;

    varying vec2 vUv;

    float when_gt(float x, float y) {
      return max(sign(x - y), 0.0);
    }

    void main() {
      vec4 texelOld = texture2D(tOld, vUv);
      vec4 texelNew = texture2D(tNew, vUv);

      texelOld *= damp;
      texelOld.r *= when_gt(texelOld.r, 0.2);
      texelOld.g *= when_gt(texelOld.g, 0.2);
      texelOld.b *= when_gt(texelOld.b, 0.2);
      texelOld.a *= when_gt(texelOld.a, 0.2);

      gl_FragColor = texelOld + texelNew;
    }`
};

export {
  GhostImageShader
};