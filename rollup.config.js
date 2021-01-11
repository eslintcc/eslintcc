const { nodeResolve } = require('@rollup/plugin-node-resolve');

module.exports = [{
  input: 'node_modules/@nodutilus/test/test.js',
  output: { file: 'build/@nodutilus-test.js', format: 'commonjs' },
  plugins: [nodeResolve()]
}]
