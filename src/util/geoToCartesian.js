import { Vector3 } from 'three';

let geoToCartesian = ( lat = 0, lon = 0, radius = 1 ) => {

	lat *= Math.PI / 180;
	lon *= Math.PI / 180;
	return new Vector3( - radius * Math.cos( lat ) * Math.cos( lon ),
		radius * Math.sin( lat ),
		radius * Math.cos( lat ) * Math.sin( lon )
	);

};

export {
	geoToCartesian
};
