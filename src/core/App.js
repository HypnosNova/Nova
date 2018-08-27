import { World } from './World.js';
import { APP_RUNNING, APP_STOP, APP_PAUSE } from './../constant.js';
import { LoopManager } from './LoopManager.js';
import { VR } from './VR.js';
import { DefaultSettings } from './settings/DefaultSettings.js';
import { Vector2, Vector3, WebGLRenderer } from 'three';
import { defaultsDeep } from "lodash";

class App {

	constructor( settings = {} ) {

		this.options = defaultsDeep( settings, DefaultSettings );
		if ( this.options.setCommonCSS ) {

			this.setCommonCSS();

		}
		this.parent = this.options.parent;
		this.renderer = new WebGLRenderer( {
			antialias: this.options.renderer.antialias,
			precision: this.options.renderer.precision,
			alpha: this.options.renderer.alpha,
			logarithmicDepthBuffer: this.options.renderer.logarithmicDepthBuffer,
			preserveDrawingBuffer: this.options.renderer.preserveDrawingBuffer
		} );
		this.renderer.setClearColor( this.options.renderer.clearColor,
			this.options.renderer.clearAlpha );
		this.world = new World( this );
		this.animationFrame;
		this.state = APP_STOP;
		this.logicLoop = new LoopManager();
		this.renderLoop = new LoopManager();
		window.addEventListener( 'resize', () => {

			this.resize();

		} );
		if ( this.options.autoStart ) {

			this.start();

		}
		if ( this.options.VRSupport ) {

			this.VR = new VR( this );

		}

	}

	resize() {

		let width = this.getWorldWidth();
		let height = this.getWorldHeight();
		this.world.resize( width, height );
		this.renderer.setSize( width, height );
		this.renderer.setPixelRatio( this.options.renderer.pixelRatio );

	}

	update( time ) {

		if ( this.state === APP_RUNNING ) {

			this.logicLoop.update( time );
			this.world.update( time );
			this.renderLoop.update( time );

		}
		this.animationFrame = requestAnimationFrame( () => {

			this.update();

		} );

	}

	setCommonCSS() {

		document.write(
			`<style>*{margin:0;padding:0} body{overflow:hidden}</style>` );

	}

	getWorldWidth() {

		return this.parent === document.body ? window.innerWidth :
			this.parent.offsetWidth;

	}

	getWorldHeight() {

		return this.parent === document.body ? window.innerHeight :
			this.parent.offsetHeight;

	}

	start() {

		if ( this.state === APP_STOP ) {

			this.state = APP_RUNNING;
			this.parent.appendChild( this.renderer.domElement );
			this.resize();
			this.update();

		}

	}

	resume() {

		if ( this.state === APP_PAUSE ) {

			this.state = APP_RUNNING;

		}

	}

	pause() {

		if ( this.state === APP_RUNNING ) {

			this.state = APP_PAUSE;

		}

	}

	destroy() {

		this.world.destroy();

	}

	openFullScreen() {

		let container = this.parent;
		this.isFullScreen = true;
		if ( container.requestFullscreen ) {

			container.requestFullscreen();

		} else if ( container.msRequestFullscreen ) {

			container.msRequestFullscreen();

		} else if ( container.mozRequestFullScreen ) {

			container.mozRequestFullScreen();

		} else if ( container.webkitRequestFullscreen ) {

			container.webkitRequestFullscreen();

		} else {

			this.isFullScreen = false;

		}
		return this.isFullScreen;

	}

	closeFullScreen() {

		let container = document;
		this.isFullScreen = false;
		if ( container.exitFullscreen ) {

			container.exitFullscreen();

		} else if ( container.mozCancelFullScreen ) {

			container.mozCancelFullScreen();

		} else if ( container.webkitExitFullScreen ) {

			container.webkitExitFullScreen();

		} else if ( container.msExitFullscreen ) {

			container.msExitFullscreen();

		} else if ( container.webkitCancelFullScreen ) {

			container.webkitCancelFullScreen();

		} else if ( container.webkitExitFullScreen ) {

			container.webkitCancelFullScreen();

		}
		return this.isFullScreen;

	}

	toggleFullScreen() {

		if ( this.isFullScreen ) {

			this.closeFullScreen();

		} else {

			this.openFullScreen();

		}

	}

	screenshot() {

		let img = new Image();
		this.renderer.render( this.world.scene, this.world.camera );
		img.src = this.renderer.domElement.toDataURL();
		let w = window.open( '', '' );
		w.document.title = "Nova Screenshot";
		w.document.body.appendChild( img );

	}

	sceneCoordinateToCanvasCoordinate( obj, camera = this.world.camera ) {

		let worldVector = obj instanceof Vector3 ? obj.clone() : obj.position.clone();
		let vector = worldVector.project( camera );
		let halfWidth = this.getWorldWidth() / 2;
		let halfHeight = this.getWorldHeight() / 2;

		return new Vector2( Math.round( vector.x * halfWidth + halfWidth ),
			Math.round( - vector.y * halfHeight + halfHeight ) );

	}

}

export {
	App
};
