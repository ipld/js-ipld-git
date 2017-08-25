'use strict'

const setImmediate = require('async/setImmediate')
const SmartBuffer = require('smart-buffer').SmartBuffer
const gitUtil = require('./util')

exports = module.exports

exports.deserialize = (data, callback) => {
  let res = {}
  let buf = SmartBuffer.fromBuffer(data, 'utf8')

  for (;;) {
    let modeName = buf.readStringNT()
    if (modeName === '') {
      break
    }

    let hash = buf.readBuffer(gitUtil.SHA1_LENGTH)
    let modNameMatched = modeName.match(/^(\d+) (.+)$/)
    if (modNameMatched === null) {
      setImmediate(() => callback(new Error('invalid file mode/name')))
    }

    if (res[modNameMatched[2]] !== undefined) {
      setImmediate(() => callback(new Error('duplicate file in tree')))
    }

    res[modNameMatched[2]] = {
      mode: modNameMatched[1],
      hash: {'/': gitUtil.shaToCid(hash).buffer}
    }
  }

  setImmediate(() => callback(null, res))
}
