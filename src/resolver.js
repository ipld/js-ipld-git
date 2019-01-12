'use strict'

const util = require('./util')
const traverse = require('traverse')

exports = module.exports

exports.multicodec = 'git-raw'
exports.defaultHashAlg = 'sha1'

const personInfoPaths = [
  'original',
  'name',
  'email',
  'date'
]

exports.resolve = async (binaryBlob, path) => {
  let node = await util.deserialize(binaryBlob)

  if (!path || path === '/') {
    return {
      value: node,
      remainderPath: ''
    }
  }

  if (Buffer.isBuffer(node)) { // git blob
    return {
      value: node,
      remainderPath: path
    }
  }

  const parts = path.split('/')
  const val = traverse(node).get(parts)

  if (val) {
    return {
      value: val,
      remainderPath: ''
    }
  }

  let value
  let len = parts.length

  for (let i = 0; i < len; i++) {
    const partialPath = parts.shift()

    if (Array.isArray(node)) {
      value = node[Number(partialPath)]
    } if (node[partialPath]) {
      value = node[partialPath]
    } else {
      // can't traverse more
      if (!value) {
        throw new Error('path not available at root')
      } else {
        parts.unshift(partialPath)
        return {
          value: value,
          remainderPath: parts.join('/')
        }
      }
    }
    node = value
  }
}

exports.tree = async (binaryBlob, options) => {
  options = options || {}

  const node = await util.deserialize(binaryBlob)

  if (Buffer.isBuffer(node)) { // git blob
    return []
  }

  let paths = []
  switch (node.gitType) {
    case 'commit':
      paths = [
        'message',
        'tree'
      ]

      paths = paths.concat(personInfoPaths.map((e) => 'author/' + e))
      paths = paths.concat(personInfoPaths.map((e) => 'committer/' + e))
      paths = paths.concat(node.parents.map((_, e) => 'parents/' + e))

      if (node.encoding) {
        paths.push('encoding')
      }
      break
    case 'tag':
      paths = [
        'object',
        'type',
        'tag',
        'message'
      ]

      if (node.tagger) {
        paths = paths.concat(personInfoPaths.map((e) => 'tagger/' + e))
      }

      break
    default: // tree
      Object.keys(node).forEach(dir => {
        paths.push(dir)
        paths.push(dir + '/hash')
        paths.push(dir + '/mode')
      })
  }
  return paths
}

exports.isLink = async (binaryBlob, path) => {
  const result = await exports.resolve(binaryBlob, path)
  if (result.remainderPath.length > 0) {
    throw new Error('path out of scope')
  }

  if (typeof result.value === 'object' && result.value['/']) {
    return result.value
  } else {
    return false
  }
}
