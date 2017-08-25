'use strict'

const setImmediate = require('async/setImmediate')

const CID_GIT_TAG = 0x78

exports = module.exports

exports.serialize = (dagNode, callback) => {
    setImmediate(() => callback(new Error("not implemented"), null))
})

exports.deserialize = (dagNode, callback) => {
    setImmediate(() => callback(new Error("not implemented"), null))
})

exports.cid = (dagNode, callback) => {
    setImmediate(() => callback(new Error("not implemented"), null))
})
