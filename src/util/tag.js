'use strict'

const SmartBuffer = require('smart-buffer').SmartBuffer
const { Buffer } = require('buffer')
const gitUtil = require('./util')

exports = module.exports

exports.serialize = (dagNode) => {
  const lines = []
  lines.push('object ' + gitUtil.cidToSha(dagNode.object).toString('hex'))
  lines.push('type ' + dagNode.type)
  lines.push('tag ' + dagNode.tag)
  if (dagNode.tagger !== null) {
    lines.push('tagger ' + gitUtil.serializePersonLine(dagNode.tagger))
  }
  lines.push('')
  lines.push(dagNode.message)

  const data = lines.join('\n')

  const outBuf = new SmartBuffer()
  outBuf.writeString('tag ')
  outBuf.writeString(data.length.toString())
  outBuf.writeUInt8(0)
  outBuf.writeString(data)
  return outBuf.toBuffer()
}

exports.deserialize = (data) => {
  const lines = data.toString().split('\n')
  const res = { gitType: 'tag' }

  for (let line = 0; line < lines.length; line++) {
    const m = lines[line].match(/^([^ ]+) (.+)$/)
    if (m === null) {
      if (lines[line] !== '') {
        throw new Error('Invalid tag line ' + line)
      }
      res.message = lines.slice(line + 1).join('\n')
      break
    }

    const key = m[1]
    const value = m[2]
    switch (key) {
      case 'object':
        res.object = gitUtil.shaToCid(Buffer.from(value, 'hex'))
        break
      case 'tagger':
        res.tagger = gitUtil.parsePersonLine(value)
        break
      case 'tag':
        res.tag = value
        break
      case 'type':
        res.type = value
        break
      default:
        res[key] = value
    }
  }

  Object.defineProperty(res, 'gitType', { enumerable: false })

  return res
}
