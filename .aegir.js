'use strict'

const path = require('path')

const esbuild = {
  // this will inject all the named exports from 'node-globals.js' as globals
  inject: [path.join(__dirname, 'scripts/node-globals.js')],
  plugins: [
    {
      name: 'node built ins', // this will make the bundler resolve node builtins to the respective browser polyfill
      setup (build) {
        build.onResolve({ filter: /^stream$/ }, () => {
          return { path: require.resolve('readable-stream') }
        })
        build.onResolve({ filter: /^zlib$/ }, () => {
          return { path: require.resolve('browserify-zlib') }
        })
      }
    }
  ]
}

/** @type {import('aegir').PartialOptions} */
module.exports = {
  test: {
    browser: {
      config: {
        buildConfig: esbuild
      }
    }
  },
  build: {
    config: esbuild
  }
}
