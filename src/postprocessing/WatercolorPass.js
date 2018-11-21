/**
 * @author mattatz / http://mattatz.github.io
 */
import { Pass } from './Pass.js';
import { WatercolorShader } from './shader/WatercolorShader.js';
import { PlaneBufferGeometry, ShaderMaterial, Mesh, Vector2, UniformsUtils, OrthographicCamera, Scene, RepeatWrapping } from "three";

class WatercolorPass extends Pass {

	constructor( tPaper, effectComposer, renderToScreen ) {

		super( effectComposer, renderToScreen );
		let shader = WatercolorShader;
		this.uniforms = UniformsUtils.clone( shader.uniforms );

		tPaper.wrapS = tPaper.wrapT = RepeatWrapping;
		this.uniforms[ "tPaper" ].value = tPaper;

		this.material = new ShaderMaterial( {
			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader
		} );

		this.enabled = true;
		this.renderToScreen = renderToScreen;
		this.needsSwap = true;

		this.camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
		this.scene = new Scene();

		this.quad = new Mesh( new PlaneBufferGeometry( 2, 2 ), undefined );
		this.scene.add( this.quad );

	}

	render( renderer, writeBuffer, readBuffer ) {

		this.uniforms[ "tDiffuse" ].value = readBuffer;
		this.uniforms[ "texel" ].value = new Vector2( 1.0 / readBuffer.width,
			1.0 / readBuffer.height );

		this.quad.material = this.material;
		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, false );

		}

	}

}

export {
	WatercolorPass
};
