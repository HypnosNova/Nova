import { World } from './World';
import { ShaderMaterial, OrthographicCamera, PlaneBufferGeometry, Mesh } from "three";
import { defaults } from "lodash";

class Transitioner {

	constructor( app, world, texture, options = {} ) {

		this.options = defaults( options, {
			'useTexture': true,
			'transition': 0,
			'speed': 10,
			'texture': 5,
			'loopTexture': true,
			'isAnimate': true,
			'threshold': 0.3
		} );
		this.app = app;
		this.targetWorld = world;
		this.maskTexture = texture;
		this.material = new ShaderMaterial( {
			uniforms: {
				tDiffuse1: {
					value: null
				},
				tDiffuse2: {
					value: null
				},
				mixRatio: {
					value: 0.0
				},
				threshold: {
					value: 0.1
				},
				useTexture: {
					value: 1
				},
				tMixTexture: {
					value: this.maskTexture
				}
			},
			vertexShader: `varying vec2 vUv;
        void main() {
        vUv = vec2( uv.x, uv.y );
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,
			fragmentShader: `uniform float mixRatio;
        uniform sampler2D tDiffuse1;
        uniform sampler2D tDiffuse2;
        uniform sampler2D tMixTexture;
        uniform int useTexture;
        uniform float threshold;
        varying vec2 vUv;
        
        void main() {

        vec4 texel1 = texture2D( tDiffuse1, vUv );
        vec4 texel2 = texture2D( tDiffuse2, vUv );

        if (useTexture==1) {

        vec4 transitionTexel = texture2D( tMixTexture, vUv );
        float r = mixRatio * (1.0 + threshold * 2.0) - threshold;
        float mixf=clamp((transitionTexel.r - r)*(1.0/threshold), 0.0, 1.0);

        gl_FragColor = mix( texel1, texel2, mixf );
        } else {

        gl_FragColor = mix( texel2, texel1, mixRatio );

        }
        }`
		} );
		let halfWidth = app.getWorldWidth() / 2;
		let halfHeight = app.getWorldHeight() / 2;
		this.world = new World( app, new OrthographicCamera( - halfWidth,
			halfWidth, halfHeight, - halfHeight, - 10, 10 ) );

		let geometry = new PlaneBufferGeometry( halfWidth * 2,
			halfHeight * 2 );

		let quad = new Mesh( geometry, this.material );
		this.world.scene.add( quad );

		this.sceneA = world;
		this.sceneB = app.world;

		this.material.uniforms.tDiffuse1.value = this.sceneA.fbo.texture;
		this.material.uniforms.tDiffuse2.value = this.sceneB.fbo.texture;

		this.needChange = false;

	}

	setThreshold( value ) {

		this.material.uniforms.threshold.value = value;

	}

	useTexture( value ) {

		this.material.uniforms.useTexture.value = value ? 1 : 0;

	}

	setTexture() {

		this.material.uniforms.tMixTexture.value = this.texture;

	}

	update() {

		let value = Math.min( this.options.transition, 1 );
		value = Math.max( value, 0 );
		this.material.uniforms.mixRatio.value = value;
		this.app.renderer.setClearColor( this.sceneB.clearColor || 0 );
		this.sceneB.update();
		this.app.renderer.render( this.sceneB.scene, this.sceneB.camera, this.sceneB
			.fbo, true );
		this.app.renderer.setClearColor( this.sceneA.clearColor || 0 );
		this.sceneA.update();
		this.app.renderer.render( this.sceneA.scene, this.sceneA.camera, this.sceneA
			.fbo, true );
		this.app.renderer.render( this.world.scene, this.world.camera, null, true );

	}

}

export {
	Transitioner
};
