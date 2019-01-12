'use strict'

const multihashing = require('multihashing-async')
const CID = require('cids')

const resolver = require('./resolver')
const gitUtil = require('./util/util')

const commit = require('./util/commit')
const tag = require('./util/tag')
const tree = require('./util/tree')

exports = module.exports

exports.serialize = async (dagNode) => {
  if (dagNode === null) {
    throw new Error('dagNode passed to serialize was null')
  }

  if (Buffer.isBuffer(dagNode)) {
    if (dagNode.slice(0, 4).toString() === 'blob') {
      return dagNode
    } else {
      throw new Error('unexpected dagNode passed to serialize')
    }
  }

  switch (dagNode.gitType) {
    case 'commit':
      return commit.serialize(dagNode)
    case 'tag':
      return tag.serialize(dagNode)
    default:
      // assume tree as a file named 'type' is legal
      return tree.serialize(dagNode)
  }
}

exports.deserialize = async (data) => {
  let headLen = gitUtil.find(data, 0)
  let head = data.slice(0, headLen).toString()
  let typeLen = head.match(/([^ ]+) (\d+)/)
  if (!typeLen) {
    throw new Error('invalid object header')
  }

  switch (typeLen[1]) {
    case 'blob':
      return data
    case 'commit':
      return commit.deserialize(data.slice(headLen + 1))
    case 'tag':
      return tag.deserialize(data.slice(headLen + 1))
    case 'tree':
      return tree.deserialize(data.slice(headLen + 1))
    default:
      throw new Error('unknown object type ' + typeLen[1])
  }
}

/**
 * Get the CID of the DAG-Node.
 *
 * @param {Object} dagNode - Internal representation
 * @param {Object} [options] - Options to create the CID
 * @param {number} [options.version=1] - CID version number
 * @param {string} [options.hashAlg='sha1'] - Hashing algorithm
 * @returns {Promise} that resolves the CID
 */
exports.cid = async (dagNode, options) => {
  options = options || {}
  const hashAlg = options.hashAlg || resolver.defaultHashAlg
  const version = typeof options.version === 'undefined' ? 1 : options.version
  const serialized = await exports.serialize(dagNode)
  const mh = await new Promise((resolve, reject) => {
    multihashing(serialized, hashAlg, (err, data) => err ? reject(err) : resolve(data))
  })
  return new CID(version, resolver.multicodec, mh)
}
