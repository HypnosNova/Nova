import glsl from './rollup-plugin-glsl';
import { eslint } from 'rollup-plugin-eslint';

export default {
	input: "src/Nova.js",
	plugins: [
		glsl(),
		eslint()
	],
	external: [ "three", "lodash", "hammer" ],
	output: [ {
		sourcemap: true,
		indent: "\t",
		format: "umd",
		name: "NOVA",
		file: "build/nova.es.js",
		globals: {
			three: "THREE",
			lodash: "_"
		}
	}, {
		format: "es",
		name: "NOVA",
		file: "build/nova.es.module.js",
		globals: {
			three: "THREE",
			lodash: "_"
		}
	} ]
};
