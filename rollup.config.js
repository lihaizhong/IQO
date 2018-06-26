import JSONPlugin from 'rollup-plugin-json'
import babelPlugin from 'rollup-plugin-babel'

export default {
  input: 'index.js',
  output: {
    file: 'dist/index.min.js',
    name: 'IQO',
    format: 'umd'
  },
  plugins: [
    JSONPlugin(),
    babelPlugin({
      exclude: 'node_modules/**',
      runtimeHelpers: true
    })
  ]
}