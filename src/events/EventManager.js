import { Raycaster, Vector2 } from "three";

class EventManager {

	constructor( world ) {

		world.eventManager = this;
		this.world = world;
		this.disable = false;
		this.isDeep = true;
		this.receivers = world.receivers;
		this.raycaster = new Raycaster();
		this.centerRaycaster = new Raycaster();
		this.selectedObj = null;
		this.centerSelectedObj = null;
		this.isDetectingEnter = true;
		let normalEventList = world.app.options.normalEventList;

		for ( let eventItem of normalEventList ) {

			world.app.parent.addEventListener( eventItem, ( event ) => {

				if ( this.disable ) return;
				this.raycastCheck( this.toNovaEvent( event ) );

			} );

		}

		try {

			if ( window.Hammer === undefined ) {

				return;

			}

		} catch ( e ) {

			console.warn( 'Hammer没有引入，手势事件无法使用，只能使用基础的交互事件。' );
			return;

		}
		this.hammer = new window.Hammer( world.app.renderer.domElement );
		this.hammer.on( world.app.options.hammerEventList, ( event ) => {

			if ( this.disable ) return;
			this.raycastCheck( event );

		} );

	}

	toNovaEvent( event ) {

		return {
			changedPointers: [ event ],
			center: new Vector2( event.clientX, event.clientY ),
			type: event.type,
			target: event.target
		};

	}

	raycastCheck( event ) {

		let vec2 = new Vector2( event.center.x / this.world.app.getWorldWidth() *
			2 - 1, 1 - event.center.y / this.world.app.getWorldHeight() * 2 );
		this.raycaster.setFromCamera( vec2, this.world.camera );
		let receiverMap;
		if ( this.world.receivers instanceof Array ) {

			receiverMap = new Map();
			receiverMap.set( Symbol(), this.world.receivers );

		} else if ( this.world.receivers instanceof Map ) {

			receiverMap = this.world.receivers;

		}
		let intersect;
		for ( let receivers of receiverMap.values() ) {

			let intersects = this.raycaster.intersectObjects( receivers, this.isDeep );
			for ( let i = 0; i < intersects.length; i ++ ) {

				if ( intersects[ i ].object.isPenetrated ||
					! intersects[ i ].object.events ||
					! intersects[ i ].object.events[ event.type ] ) {

					continue;

				} else {

					intersect = intersects[ i ];
					break;

				}

			}
			if ( intersect ) {

				intersect.object.events[ event.type ].run( event, intersect );

			}
			return intersect;

		}

	}

}

export {
	EventManager
};
