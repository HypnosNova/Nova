import glsl from './rollup-plugin-glsl';
import babel from 'rollup-plugin-babel';
import {
	eslint
} from 'rollup-plugin-eslint';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
	input: "src/Nova.js",
	plugins: [
		nodeResolve( {
			jsnext: true,
			main: true
		} ),
		commonjs( {
			include: 'node_modules/**',
		} ),
		glsl(),
		eslint(),
		babel( {
			babelrc: true
		} )
	],
	output: [ {
		sourcemap: true,
		indent: "\t",
		format: "umd",
		name: "NOVA",
		file: "build/nova.js",
		globals: {
			three: "THREE"
		}
	}, {
		format: "es",
		name: "NOVA",
		file: "build/nova.module.js",
		globals: {
			three: "THREE"
		}
	} ]
};
