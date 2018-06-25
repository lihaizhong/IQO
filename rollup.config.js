import JSONPlugin from 'rollup-plugin-json'
import babelPlugin from 'rollup-plugin-babel'

export default {
  input: 'src/IQO/index.js',
  output: {
    file: 'package/IQO/index.js',
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