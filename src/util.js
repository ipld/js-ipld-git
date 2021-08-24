'use strict'

const multihashing = require('multihashing-async')
const CID = require('cids')
const multicodec = require('multicodec')
const { Buffer } = require('buffer')
const { toString: uint8ArrayToString } = require('uint8arrays/to-string')

const gitUtil = require('./util/util')

const commit = require('./util/commit')
const tag = require('./util/tag')
const tree = require('./util/tree')

const codec = multicodec.GIT_RAW
const defaultHashAlg = multicodec.SHA1

/**
 * Serialize internal representation into a binary Git block.
 *
 * @param {GitBlock} dagNode - Internal representation of a Git block
 * @returns {Uint8Array}
 */
function serialize (dagNode) {
  if (dagNode === null) {
    throw new Error('dagNode passed to serialize was null')
  }

  if (dagNode instanceof Uint8Array) {
    if (uint8ArrayToString(dagNode.slice(0, 4)) === 'blob') {
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

/**
 * Deserialize Git block into the internal representation.
 *
 * @param {Uint8Array} data - Binary representation of a Git block.
 */
function deserialize (data) {
  if (!Buffer.isBuffer(data)) {
    data = Buffer.from(data.buffer, data.byteOffset, data.byteLength)
  }

  const headLen = gitUtil.find(data, 0)
  const head = data.slice(0, headLen).toString()
  const typeLen = head.match(/([^ ]+) (\d+)/)
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
 * Calculate the CID of the binary blob.
 *
 * @param {Object} binaryBlob - Encoded IPLD Node
 * @param {Object} [userOptions] - Options to create the CID
 * @param {number} [userOptions.cidVersion=1] - CID version number
 * @param {string} [userOptions.hashAlg] - Defaults to the defaultHashAlg of the format
 */
async function cid (binaryBlob, userOptions) {
  const defaultOptions = { cidVersion: 1, hashAlg: defaultHashAlg }
  const options = Object.assign(defaultOptions, userOptions)

  const multihash = await multihashing(binaryBlob, options.hashAlg)
  const codecName = multicodec.getNameFromCode(codec)
  const cid = new CID(options.cidVersion, codecName, multihash)

  return cid
}

module.exports = {
  codec,
  defaultHashAlg,
  serialize,
  deserialize,
  cid
}
