import { Pass } from './Pass.js';

class ClearMaskPass extends Pass {

	constructor() {
		super();
		this.needsSwap = false;
	}

	render(renderer) {

		renderer.state.buffers.stencil.setTest(false);

	}

};

export {
	ClearMaskPass
};