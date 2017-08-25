'use strict'

const setImmediate = require('async/setImmediate')

exports = module.exports

exports.multicodec = 'git-raw'

exports.resolve = (block, path, callback) => {
  setImmediate(() => callback(new Error('not implemented'), null))
}

exports.tree = (block, options, callback) => {
  setImmediate(() => callback(new Error('not implemented'), null))
}
