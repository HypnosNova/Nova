import NotFunctionError from './../error/NotFunctionError';
import remove from "lodash/remove";
/**
 * 用于事件处理
 *
 * */
export default class Signal {

	constructor( type ) {

		this.type = type;
		this.functionArr = [];

	}

	add( func ) {

		if ( typeof func !== 'function' ) {

			throw new NotFunctionError();

		} else {

			this.functionArr.push( func );

		}

	}

	remove( func ) {

		return remove( this.functionArr, function ( n ) {

			return n === func;

		} );

	}

	run( event, intersect ) {

		this.functionArr.forEach(
			( func ) => {

				func( event, intersect );

			} );

	}

}
