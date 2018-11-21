let TestShader = {
	uniforms: {
		"tDiffuse": {
			type: 't',
			value: null
		},
		"resolution": {
			type: 'v2',
			value: new THREE.Vector2( innerWidth, innerHeight )
		}
	},

	vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,

	fragmentShader: `
	varying vec2 vUv;
	uniform sampler2D tDiffuse;
	uniform vec2 iResolution;
	#define Sensitivity (vec2(0.3, 1.5) * iResolution.y / 400.0)

float checkSame(vec4 center, vec4 samplef)
{
    vec2 centerNormal = center.xy;
    float centerDepth = center.z;
    vec2 sampleNormal = samplef.xy;
    float sampleDepth = samplef.z;
    
    vec2 diffNormal = abs(centerNormal - sampleNormal) * Sensitivity.x;
    bool isSameNormal = (diffNormal.x + diffNormal.y) < 0.1;
    float diffDepth = abs(centerDepth - sampleDepth) * Sensitivity.y;
    bool isSameDepth = diffDepth < 0.1;
    
    return (isSameNormal && isSameDepth) ? 1.0 : 0.0;
}

void main()
{
    vec4 sample0 = texture2D(tDiffuse, vUv);
    vec4 sample1 = texture2D(tDiffuse, vUv + vec2(1.0, 1.0) / iResolution.xy);
    vec4 sample2 = texture2D(tDiffuse, vUv + vec2(-1.0, -1.0) / iResolution.xy);
    vec4 sample3 = texture2D(tDiffuse, vUv + vec2(-1.0, 1.0) / iResolution.xy);
    vec4 sample4 = texture2D(tDiffuse, vUv + vec2(1.0, -1.0) / iResolution.xy);
    
    float edge = checkSame(sample1, sample2) * checkSame(sample3, sample4);
    
    gl_FragColor = vec4(edge, sample0.w, 0.50, 1.0);
}`
};