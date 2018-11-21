class Pass {

	constructor( effectComposer, renderToScreen = false ) {

		// if set to true, the pass is processed by the composer
		this.enabled = true;
		// if set to true, the pass indicates to swap read and write buffer after rendering
		this.needsSwap = true;
		// if set to true, the pass clears its buffer before rendering
		this.clear = false;
		// if set to true, the result of the pass is rendered to screen
		this.renderToScreen = renderToScreen;
		if ( effectComposer ) {

			effectComposer.addPass( this );

		}

	}
	setSize() {} // width, height
	render() {} // renderer, writeBuffer, readBuffer, delta, maskActive

}

export {
	Pass
};
