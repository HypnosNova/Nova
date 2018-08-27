class FBOEventMapper {

	constructor( fboWorld, mesh, faceIndexArr ) {

		this.world = fboWorld;
		this.disable = false;
		this.isDeep = true;
		this.receivers = fboWorld.receivers;
		this.raycaster = new THREE.Raycaster();
		this.mesh = mesh;
		this.faceIndexArr = faceIndexArr || [];

	}

	dispatch( event, intersect ) {

		if ( intersect.object === this.mesh ) {

			if ( this.faceIndexArr && this.faceIndexArr.length === 0 ) {

				this.raycastCheck( event, intersect );

			} else if ( ! this.faceIndexArr ) {

				this.raycastCheck( event, intersect );

			} else {

				if ( this.faceIndexArr.includes( intersect.faceIndex ) ) {

					this.raycastCheck( event, intersect );

				}

			}

		}

	}

	toNovaEvent( event ) {

		return {
			changedPointers: [ event ],
			center: new THREE.Vector2( event.clientX, event.clientY ),
			type: event.type,
			target: event.target
		};

	}

	raycastCheck( event, intersect ) {

		let uv = intersect.uv;
		let vec2 = new THREE.Vector2( uv.x * 2 - 1, uv.y * 2 - 1 );
		this.raycaster.setFromCamera( vec2, this.world.camera );
		intersect = undefined;

		let intersects = this.raycaster.intersectObjects( this.world.receivers, this.isDeep );
		for ( let i = 0; i < intersects.length; i ++ ) {

			if ( intersects[ i ].object.isPenetrated ) {

				continue;

			} else {

				intersect = intersects[ i ];
				break;

			}

		}

		if ( intersect && intersect.object.events && intersect.object.events[ event
			.type ] ) {

			intersect.object.events[ event.type ].run( event, intersect );

		}
		return intersect;

	}

}

export {
	FBOEventMapper
};
