'use strict'

const CID = require('cids')
const util = require('./util')

/**
 * Resolves a path within a Git block.
 *
 * Returns the value or a link and the partial mising path. This way the
 * IPLD Resolver can fetch the link and continue to resolve.
 *
 * @param {Uint8Array} binaryBlob - Binary representation of a Git block
 * @param {string} [path='/'] - Path that should be resolved
 */
function resolve (binaryBlob, path) {
  let node = util.deserialize(binaryBlob)

  const parts = path.split('/').filter(Boolean)
  while (parts.length) {
    const key = parts.shift()
    if (node[key] === undefined) {
      throw new Error(`Object has no property '${key}'`)
    }

    node = node[key]
    if (CID.isCID(node)) {
      return {
        value: node,
        remainderPath: parts.join('/')
      }
    }
  }

  return {
    value: node,
    remainderPath: ''
  }
}

function * traverse (node, path) {
  // Traverse only objects and arrays
  if (node instanceof Uint8Array || CID.isCID(node) || typeof node === 'string' ||
      node === null) {
    return
  }
  for (const item of Object.keys(node)) {
    const nextpath = path === undefined ? item : path + '/' + item
    yield nextpath
    yield * traverse(node[item], nextpath)
  }
}

/**
 * Return all available paths of a block.
 *
 * @generator
 * @param {Uint8Array} binaryBlob - Binary representation of a Bitcoin block
 * @yields {string} - A single path
 */
function * tree (binaryBlob) {
  const node = util.deserialize(binaryBlob)

  yield * traverse(node)
}

module.exports = {
  resolve,
  tree
}
