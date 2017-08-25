'use strict'

const setImmediate = require('async/setImmediate')
const waterfall = require('async/waterfall')
const multihashing = require('multihashing-async')
const CID = require('cids')

const resolver = require('./resolver')
const gitUtil = require('./util/util')

const commit = require('./util/commit')
const tag = require('./util/tag')
const tree = require('./util/tree')

exports = module.exports

exports.serialize = (dagNode, callback) => {
  setImmediate(() => callback(new Error('not implemented'), null))
}

exports.deserialize = (data, callback) => {
  let headLen = gitUtil.find(data, 0)
  let head = data.slice(0, headLen).toString()
  let typeLen = head.match(/([^ ]+) (\d+)/)
  if (typeLen === null) {
    setImmediate(() => callback(new Error('invalid object header'), null))
  }

  switch (typeLen[1]) {
    case 'blob':
      callback(null, data)
      break
    case 'commit':
      commit.deserialize(data.slice(headLen + 1), callback)
      break
    case 'tag':
      tag.deserialize(data.slice(headLen + 1), callback)
      break
    case 'tree':
      tree.deserialize(data.slice(headLen + 1), callback)
      break
    default:
      setImmediate(() => callback(new Error('unknown object type ' + typeLen[1]), null))
  }
}

exports.cid = (dagNode, callback) => {
  waterfall([
    (cb) => exports.serialize(dagNode, cb),
    (serialized, cb) => multihashing(serialized, 'sha1', cb),
    (mh, cb) => cb(null, new CID(1, resolver.multicodec, mh))
  ], callback)
}
