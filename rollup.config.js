function glsl() {
  return {
    transform( code, id ) {
      if( /\.glsl$/.test( id ) ===
        false ) return;
      var transformedCode =
        'export default ' + JSON.stringify(
          code
          .replace( /[ \t]*\/\/.*\n/g,
            '' ) // remove //
          .replace(
            /[ \t]*\/\*[\s\S]*?\*\//g,
            '' ) // remove /* */
          .replace( /\n{2,}/g, '\n' ) // # \n+ to \n
        ) + ';';
      return {
        code: transformedCode,
        map: {
          mappings: ''
        }
      };
    }
  };
}

export default {
  input: 'src/Nova.js',
  indent: '\t',
  plugins: [
    glsl()
  ],
  sourcemap: true,
  output: [ {
      format: 'umd',
      name: 'NOVA',
      file: 'build/nova.js'
    },
    {
      format: 'es',
      file: 'build/nova.module.js'
    }
  ]
};