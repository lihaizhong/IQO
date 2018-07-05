import JSONPlugin from 'rollup-plugin-json'
import babelPlugin from 'rollup-plugin-babel'
import resolvePlugin from 'rollup-plugin-node-resolve'
import commonjsPlugin from 'rollup-plugin-commonjs'

export default {
  input: 'index.js',
  output: {
    file: 'dist/index.es.js',
    name: 'IQO',
    format: 'es',
    globals: {
      IQO: 'IQO'
    }
  },
  plugins: [
    JSONPlugin(),
    babelPlugin({
      exclude: 'node_modules/**',
      runtimeHelpers: true
    }),
    resolvePlugin({
      jsnext: true,
      main: true,
      browser: true,
      module: true
    }),
    commonjsPlugin({
      include: 'node_modules/**'
    })
  ]
}