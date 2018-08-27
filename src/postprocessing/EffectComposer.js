import { CopyShader } from './shader/CopyShader.js';
import { ShaderPass } from './ShaderPass.js';
import { RenderPass } from './RenderPass.js';
import { MaskPass } from './MaskPass';
import { ClearMaskPass } from './ClearMaskPass';
import { defaults } from "lodash";
import { WebGLRenderTarget, LinearFilter, RGBAFormat } from "three";

class EffectComposer {

	constructor( world, options = {}, renderTarget ) {

		options = defaults( options, {
			renderer: undefined,
			camera: undefined,
			scene: undefined,
			overrideMaterial: undefined,
			clearColor: undefined,
			clearAlpha: 0
		} );
		this.renderer = options.renderer || world.app.renderer;
		if ( renderTarget === undefined ) {

			let parameters = {
				minFilter: LinearFilter,
				magFilter: LinearFilter,
				format: RGBAFormat,
				stencilBuffer: false
			};
			let size = this.renderer.getDrawingBufferSize();
			renderTarget = new WebGLRenderTarget( size.width, size.height,
				parameters );
			renderTarget.texture.name = 'EffectComposer.rt1';

		}

		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();
		this.renderTarget2.texture.name = 'EffectComposer.rt2';
		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		this.passes = [];
		this.copyPass = new ShaderPass( CopyShader );

		this.addPass( new RenderPass( options.scene || world.scene,
			options.scene || world.camera ) );

	}

	swapBuffers() {

		let tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	}

	addPass( pass ) {

		this.passes.push( pass );
		let size = this.renderer.getDrawingBufferSize();
		pass.setSize( size.width, size.height );

	}

	insertPass( pass, index ) {

		this.passes.splice( index, 0, pass );

	}

	render( delta ) {

		let maskActive = false;
		let pass, i, il = this.passes.length;
		for ( i = 0; i < il; i ++ ) {

			pass = this.passes[ i ];
			if ( pass.enabled === false ) continue;
			pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta,
				maskActive );

			if ( pass.needsSwap ) {

				if ( maskActive ) {

					let context = this.renderer.context;
					context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );
					this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer,
						delta );
					context.stencilFunc( context.EQUAL, 1, 0xffffffff );

				}
				this.swapBuffers();

			}

			if ( MaskPass !== undefined ) {

				if ( pass instanceof MaskPass ) {

					maskActive = true;

				} else if ( pass instanceof ClearMaskPass ) {

					maskActive = false;

				}

			}

		}

	}

	reset( renderTarget ) {

		if ( renderTarget === undefined ) {

			let size = this.renderer.getDrawingBufferSize();
			renderTarget = this.renderTarget1.clone();
			renderTarget.setSize( size.width, size.height );

		}
		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();
		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

	}

	setSize( width, height ) {

		this.renderTarget1.setSize( width, height );
		this.renderTarget2.setSize( width, height );
		for ( let i = 0; i < this.passes.length; i ++ ) {

			this.passes[ i ].setSize( width, height );

		}

	}

}

export {
	EffectComposer
};
