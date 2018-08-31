import glsl from './rollup-plugin-glsl';
import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';

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
		} )
	],
	external: [ "three", "lodash", "hammer" ],
	output: [ {
		sourcemap: true,
		indent: "\t",
		format: "umd",
		name: "NOVA",
		file: "build/nova.js",
		globals: {
			three: "THREE",
			lodash: "_"
		}
	}, {
		format: "es",
		name: "NOVA",
		file: "build/nova.module.js",
		globals: {
			three: "THREE",
			lodash: "_"
		}
	} ]
};
