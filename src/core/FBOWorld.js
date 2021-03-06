import LoopManager from './LoopManager';
import { Scene, PerspectiveCamera, LinearFilter, WebGLRenderTarget, RGBFormat } from "three";

export default class FBOWorld {

	constructor( app, camera, width, height ) {

		this.width = width;
		this.height = height;
		this.app = app;
		this.scene = new Scene();
		this.logicLoop = new LoopManager();
		this.renderLoop = new LoopManager();
		this.camera = camera || new PerspectiveCamera( 45, this.width / this.height, 0.01, 5000 );
		this.receivers = this.scene.children;

		this.renderTargetParameters = {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: RGBFormat,
			stencilBuffer: false
		};
		this.clearColor = 0;
		this.fbo = new WebGLRenderTarget( this.width,
			this.height, this.renderTargetParameters );
		this.defaultRenderID = Symbol();
		this.defaultUpdateID = Symbol();
		this.resize();
		this.renderLoop.add( () => {

			this.app.renderer.render( this.scene, this.camera, this.fbo, true );

		}, this.defaultRenderID );

	}

	update = ( time ) => {

		this.logicLoop.update( time );
		this.renderLoop.update( time );

	}

	resize = () => {

		if ( this.camera.type === 'PerspectiveCamera' ) {

			this.camera.aspect = this.width / this.height;
			this.camera.updateProjectionMatrix();

		} else {

			this.camera.left = - this.width / 2;
			this.camera.right = this.width / 2;
			this.camera.top = this.height / 2;
			this.camera.bottom = - this.height / 2;
			this.camera.updateProjectionMatrix();

		}

	}

}
