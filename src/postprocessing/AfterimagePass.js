import { Pass } from './Pass.js';
import { AfterimageShader } from './shader/AfterimageShader.js';
import { WebGLRenderTarget, LinearFilter, NearestFilter, RGBAFormat, UniformsUtils, Scene, OrthographicCamera, PlaneBufferGeometry, Mesh, MeshBasicMaterial, ShaderMaterial } from "three";

class AfterimagePass extends Pass {

	constructor( damp = 0.96, effectComposer, renderToScreen = false ) {

		super( effectComposer, renderToScreen );
		this.uniforms = UniformsUtils.clone( AfterimageShader.uniforms );
		this.uniforms[ "damp" ].value = damp;

		this.textureComp = new WebGLRenderTarget( window.innerWidth, window.innerHeight, {
			minFilter: LinearFilter,
			magFilter: NearestFilter,
			format: RGBAFormat
		} );

		this.textureOld = new WebGLRenderTarget( window.innerWidth, window.innerHeight, {
			minFilter: LinearFilter,
			magFilter: NearestFilter,
			format: RGBAFormat
		} );

		this.shaderMaterial = new ShaderMaterial( {
			uniforms: this.uniforms,
			vertexShader: AfterimageShader.vertexShader,
			fragmentShader: AfterimageShader.fragmentShader
		} );

		this.sceneComp = new Scene();
		this.sceneScreen = new Scene();

		this.camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
		this.camera.position.z = 1;
		var geometry = new PlaneBufferGeometry( 2, 2 );

		this.quadComp = new Mesh( geometry, this.shaderMaterial );
		this.sceneComp.add( this.quadComp );

		let material = new MeshBasicMaterial( { map: this.textureComp.texture } );
		var quadScreen = new Mesh( geometry, material );
		this.sceneScreen.add( quadScreen );

	}

	render( renderer, writeBuffer, readBuffer ) {

		this.uniforms[ "tOld" ].value = this.textureOld.texture;
		this.uniforms[ "tNew" ].value = readBuffer.texture;
		this.quadComp.material = this.shaderMaterial;

		renderer.render( this.sceneComp, this.camera, this.textureComp );
		renderer.render( this.sceneScreen, this.camera, this.textureOld );
		if ( this.renderToScreen ) {

			renderer.render( this.sceneScreen, this.camera );

		} else {

			renderer.render( this.sceneScreen, this.camera, writeBuffer, this.clear );

		}

	}

}

export {
	AfterimagePass
};
