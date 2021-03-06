import { Pass } from './Pass.js';
import { TestShader } from './shader/TestShader.js';
import { PlaneBufferGeometry, ShaderMaterial, Mesh, UniformsUtils, OrthographicCamera, Scene } from "three";

class TestPass extends Pass {

	constructor( center, angle, scale, effectComposer, renderToScreen = false ) {

		super( effectComposer, renderToScreen );
		this.uniforms = UniformsUtils.clone( TestShader.uniforms );
		if ( center !== undefined ) this.uniforms[ "center" ].value.copy( center );
		if ( angle !== undefined ) this.uniforms[ "angle" ].value = angle;
		if ( scale !== undefined ) this.uniforms[ "scale" ].value = scale;

		this.material = new ShaderMaterial( {
			uniforms: this.uniforms,
			vertexShader: TestShader.vertexShader,
			fragmentShader: TestShader.fragmentShader
		} );

		this.camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
		this.scene = new Scene();
		this.quad = new Mesh( new PlaneBufferGeometry( 2, 2 ), null );
		this.quad.frustumCulled = false; // Avoid getting clipped
		this.scene.add( this.quad );

	}

	render( renderer, writeBuffer, readBuffer ) {

		this.uniforms[ "tDiffuse" ].value = readBuffer.texture;
		this.uniforms[ "tSize" ].value.set( readBuffer.width, readBuffer.height );

		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	}

}

export {
	TestPass
};
