import { Mesh, Shape, ShapeBufferGeometry } from "three";

class Icon extends Mesh {

	constructor( material, width = 64, height = 64, radius = 16 ) {

		let roundedRectShape = new Shape();
		( function ( ctx, x, y, width, height, radius ) {

			ctx.moveTo( x, y + radius );
			ctx.lineTo( x, y + height - radius );
			ctx.quadraticCurveTo( x, y + height, x + radius, y + height );
			ctx.lineTo( x + width - radius, y + height );
			ctx.quadraticCurveTo( x + width, y + height, x + width, y + height -
        radius );
			ctx.lineTo( x + width, y + radius );
			ctx.quadraticCurveTo( x + width, y, x + width - radius, y );
			ctx.lineTo( x + radius, y );
			ctx.quadraticCurveTo( x, y, x, y + radius );

		} )( roundedRectShape, 0, 0, width, height, radius );

		let roundRectGeometry = new ShapeBufferGeometry( roundedRectShape );
		roundRectGeometry.center();
		super( roundRectGeometry, material );

	}

}

export {
	Icon
};
