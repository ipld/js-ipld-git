'use strict'

const SmartBuffer = require('smart-buffer').SmartBuffer
const multihashes = require('multihashes/src/constants')
const multicodecs = require('multicodec/src/base-table')

exports = module.exports

exports.SHA1_LENGTH = multihashes.defaultLengths[multihashes.names.sha1]

exports.find = (buf, byte) => {
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === byte) {
      return i
    }
  }
  return -1
}

exports.parsePersonLine = (line) => {
  let matched = line.match(/^(([^<]+)\s)?\s?<([^>]+)>\s?(\d+)?\s?([+\-\d]+)?$/)
  if (matched === null) {
    return null
  }

  return {
    name: matched[2],
    email: matched[3],
    date: matched[4],
    timezone: matched[5]
  }
}

exports.shaToCid = (buf) => {
  let mhashBuf = new SmartBuffer()
  mhashBuf.writeUInt8(1)
  mhashBuf.writeUInt8(multicodecs['git-raw'])
  mhashBuf.writeUInt8(multihashes.names.sha1)
  mhashBuf.writeUInt8(exports.SHA1_LENGTH)
  mhashBuf.writeBuffer(buf)
  return mhashBuf.toBuffer()
}
