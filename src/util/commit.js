'use strict'

const setImmediate = require('async/setImmediate')
const SmartBuffer = require('smart-buffer').SmartBuffer
const gitUtil = require('./util')

exports = module.exports

exports.serialize = (dagNode, callback) => {
  let lines = []
  lines.push('tree ' + gitUtil.cidToSha(dagNode.tree['/']).toString('hex'))
  dagNode.parents.forEach((parent) => {
    lines.push('parent ' + gitUtil.cidToSha(parent['/']).toString('hex'))
  })
  lines.push('author ' + gitUtil.serializePersonLine(dagNode.author))
  lines.push('committer ' + gitUtil.serializePersonLine(dagNode.committer))
  if (dagNode.encoding !== undefined) {
    lines.push('encoding ' + dagNode.encoding)
  }
  lines.push('')
  lines.push(dagNode.message)

  let data = lines.join('\n')

  let outBuf = new SmartBuffer()
  outBuf.writeString('commit ')
  outBuf.writeString(data.length.toString())
  outBuf.writeUInt8(0)
  outBuf.writeString(data)
  setImmediate(() => callback(null, outBuf.toBuffer()))
}

exports.deserialize = (data, callback) => {
  let lines = data.toString().split('\n')
  let res = {gitType: 'commit', parents: []}

  for (let line = 0; line < lines.length; line++) {
    let m = lines[line].match(/^([^ ]+) (.+)$/)
    if (!m) {
      if (lines[line] !== '') {
        setImmediate(() => callback(new Error('Invalid tag line ' + line)))
      }
      res.message = lines.slice(line + 1).join('\n')
      break
    }

    let key = m[1]
    let value = m[2]
    switch (key) {
      case 'tree':
        res.tree = {'/': gitUtil.shaToCid(new Buffer(value, 'hex'))}
        break
      case 'committer':
        res.committer = gitUtil.parsePersonLine(value)
        break
      case 'author':
        res.author = gitUtil.parsePersonLine(value)
        break
      case 'parent':
        res.parents.push({'/': gitUtil.shaToCid(new Buffer(value, 'hex'))})
        break
      default:
        res[key] = value
    }
  }

  setImmediate(() => callback(null, res))
}
