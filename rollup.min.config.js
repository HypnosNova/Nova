

import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';
import { uglify } from 'rollup-plugin-uglify';
import glsl from './rollup-plugin-glsl';

export default {
	input: "src/Nova.js",
	plugins: [
		glsl(),
		eslint(),
		babel( {
			babelrc: false,
			"plugins": [
				"external-helpers"
			],
			presets: [[ 'es2015', { modules: false } ]]
		} ),
		//
		uglify()
	],
	external: [ "three", "lodash", "hammer" ],
	output: [ {
		sourcemap: true,
		indent: "\t",
		format: "umd",
		name: "NOVA",
		file: "build/nova.min.js",
		globals: {
			three: "THREE",
			lodash: "_"
		}
	} ]
};
