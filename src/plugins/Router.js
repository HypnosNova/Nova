class HashRouter {

	constructor( route ) {

		this.routes = new Map();
		this.defaultRoute = route || new Route( "", () => { } );
		this.routes.set( this.defaultRoute.url, this.defaultRoute );
		this.currentUrl = this.defaultRoute.url;

		window.addEventListener( 'load', () => {

			let currentURL = location.hash.slice( 1 ) || defaultUrl;
			if ( currentURL !== this.currentUrl ) {

				this.route( currentURL );

			}

		}, false );

		window.addEventListener( 'hashchange', () => {

			let currentURL = location.hash.slice( 1 ) || defaultUrl;
			if ( currentURL !== this.currentUrl ) {

				this.route( currentURL );

			}

		}, false );

	}

	static getRequest() {

		let url = location.hash;
		let theRequest = new Object();
		if ( url.indexOf( "?" ) != - 1 ) {

			let str = url.substr( url.indexOf( "?" ) + 1 );
			let strs = str.split( "&" );
			for ( let i = 0; i < strs.length; i ++ ) {

				let arr = strs[ i ].split( "=" );
				theRequest[ arr[ 0 ] ] = unescape( arr[ 1 ] );

			}

		}
		return theRequest;

	}

	route( url ) {

		if ( url.indexOf( "/" ) > - 1 ) {

			url = url.substr( url.indexOf( "/" ) + 1 );

		}
		if ( url.indexOf( "?" ) > - 1 ) {

			url = url.substring( 0, url.indexOf( "?" ) );

		}
		let route = this.routes.get( url );
		if ( route ) {

			route.action( HashRouter.getRequest() );

		}

	}

	add( route ) {

		this.routes.set( route.url, route );

	}

}

class Route {

	constructor( url, action ) {

		this.url = url;
		if ( this.url.indexOf( "/" ) > - 1 ) {

			this.url = this.url.substr( this.url.indexOf( "/" ) + 1 );

		}
		if ( this.url.indexOf( "?" ) > - 1 ) {

			this.url = this.url.substring( 0, this.url.indexOf( "?" ) );

		}
		this.action = action;

	}

}

export {
	HashRouter,
	Route
};
