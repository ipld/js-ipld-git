'use strict'

const SmartBuffer = require('smart-buffer').SmartBuffer
const gitUtil = require('./util')

exports = module.exports

exports.serialize = (dagNode) => {
  const entries = []
  Object.keys(dagNode).forEach((name) => {
    entries.push([name, dagNode[name]])
  })
  entries.sort((a, b) => {
    const aName = a[0] + (a[1].mode === '40000' ? '/' : '')
    const bName = b[0] + (b[1].mode === '40000' ? '/' : '')
    return aName > bName ? 1 : -1
  })
  const buf = new SmartBuffer()
  entries.forEach((entry) => {
    buf.writeStringNT(entry[1].mode + ' ' + entry[0])
    buf.writeBuffer(gitUtil.cidToSha(entry[1].hash))
  })

  const outBuf = new SmartBuffer()
  outBuf.writeString('tree ')
  outBuf.writeString(buf.length.toString())
  outBuf.writeUInt8(0)
  outBuf.writeBuffer(buf.toBuffer())
  return outBuf.toBuffer()
}

exports.deserialize = (data) => {
  const res = {}
  const buf = SmartBuffer.fromBuffer(data, 'utf8')

  for (;;) {
    const modeName = buf.readStringNT()
    if (modeName === '') {
      break
    }

    const hash = buf.readBuffer(gitUtil.SHA1_LENGTH)
    const modNameMatched = modeName.match(/^(\d+) (.+)$/)
    if (!modNameMatched) {
      throw new Error('invalid file mode/name')
    }

    if (res[modNameMatched[2]]) {
      throw new Error('duplicate file in tree')
    }

    res[modNameMatched[2]] = {
      mode: modNameMatched[1],
      hash: gitUtil.shaToCid(hash)
    }
  }

  return res
}
