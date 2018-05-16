let TestShader = {
	uniforms: {
		"tDiffuse": { value: null },
		"tSize": { value: new THREE.Vector2( 256, 256 ) },
		"center": { value: new THREE.Vector2( 0.5, 0.5 ) },
		"angle": { value: 1.57 },
		"scale": { value: 1.0 }
	},

	vertexShader: [
		"varying vec2 vUv;",
		"void main() {",
		"vUv = uv;",
		"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
	].join( "\n" ),

	fragmentShader: [
		`uniform vec2 center;
    uniform float angle;
    uniform float scale;
    uniform vec2 tSize;
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    float pattern() {
      float s = sin( angle ), c = cos( angle );
      vec2 tex = vUv * tSize - center;
      vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;
      return ( sin( point.x ) * sin( point.y ) ) * 4.0;
    }

const float PI = 3.1415926536;
const float PI2 = PI * 2.0; 
const int mSize = 9;
const int kSize = (mSize-1)/2;
const float sigma = 3.0;
float kernel[mSize];

float normpdf(in float x, in float sigma) 
{
	return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;
}

vec3 colorDodge(in vec3 src, in vec3 dst)
{
    return step(0.0, dst) * mix(min(vec3(1.0), dst/ (1.0 - src)), vec3(1.0), step(1.0, src)); 
}

float greyScale(in vec3 col) 
{
    return dot(col, vec3(0.3, 0.59, 0.11));
    //return dot(col, vec3(0.2126, 0.7152, 0.0722)); //sRGB
}

vec2 random(vec2 p){
	p = fract(p * vec2(443.897, 441.423));
    p += dot(p, p.yx+19.19);
    return fract((p.xx+p.yx)*p.xy);
}


    void main() {
    	vec2 q = -1.0 + 2.0 *vUv;
      vec4 color = texture2D( tDiffuse, vUv );
      vec3 col = color.rgb;
      
      vec2 r = random(q);
      r.x *= PI2;
      vec2 cr = vec2(sin(r.x),cos(r.x))*sqrt(r.y);
    
      vec3 blurred = color.rgb;
    
    
    vec3 inv = vec3(1.0) - blurred; 
    // color dodge
    vec3 lighten = colorDodge(col, inv);
    // grey scale
    vec3 res = vec3(greyScale(lighten));
    
    // more contrast
    res = vec3(pow(res.x, 3.0)); 
      
      
      gl_FragColor = vec4( res,1.0 );
    }`
	].join( "\n" )
};

export {
	TestShader
};