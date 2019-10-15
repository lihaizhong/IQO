import path from 'path'
import BannerPlugin from 'rollup-plugin-banner'
import JSONPlugin from 'rollup-plugin-json'
import babelPlugin from 'rollup-plugin-babel'
import resolvePlugin from 'rollup-plugin-node-resolve'
import commonjsPlugin from 'rollup-plugin-commonjs'
import { uglify } from 'rollup-plugin-uglify'

export default {
  input: 'index.js',
  output: {
    file: 'dist/iqo.min.js',
    name: 'IQO',
    format: 'umd',
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
    }),
    uglify(),
    BannerPlugin({
      file: path.resolve(__dirname, 'banner.txt'),
      encoding: 'utf-8'
    })
  ]
}
