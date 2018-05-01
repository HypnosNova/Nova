let AfterimageShader = {
  uniforms: {
    "damp": { value: 0.96 },
    "tOld": { value: null },
    "tNew": { value: null }
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

    vec4 when_gt( vec4 texel, float y ) {
      return max( sign( texel - y ), 0. );
    }

    void main() {
      vec4 texelOld = texture2D( tOld, vUv );
      vec4 texelNew = texture2D( tNew, vUv );

      texelOld *= damp * when_gt( texelOld, 0.1 );

      gl_FragColor = max( texelNew, texelOld );
    }`
};

export {
  AfterimageShader
};