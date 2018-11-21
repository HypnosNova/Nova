export default class Bind {

	constructor( obj ) {

		for ( let i in obj ) {

			this[ i ] = obj[ i ];
			this.bindMap = new Map();
			this.defineReactive( this, i, this[ i ] );

		}

	}

	add = ( obj, funcs = {} ) => {

		this.bindMap.set( obj, funcs );

	}

	remove = ( obj ) => {

		this.bindMap.delete( obj );

	}

	defineReactive = ( data, key, val ) => {

		Object.defineProperty( data, key, {
			enumerable: true,
			configurable: false,
			get: function () {

				return val;

			},
			set: ( newVal ) => {

				val = newVal;
				let bindMap = data.bindMap;
				for ( let [ obj, funcs ] of bindMap ) {

					if ( obj[ key ] !== undefined ) {

						obj[ key ] = funcs[ key ] ? funcs[ key ]( val, obj ) : val;

					}

				}

			}
		} );

	}

}
