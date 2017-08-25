'use strict'

const setImmediate = require('async/setImmediate')
const gitUtil = require('./util')

exports = module.exports

exports.deserialize = (data, callback) => {
  let lines = data.toString().split('\n')
  let res = {}

  for (let line = 0; line < lines.length; line++) {
    let m = lines[line].match(/([^ ]+) (.+)$/)
    if (m === null) {
      if (lines[line] !== '') {
        setImmediate(() => callback(new Error('Invalid tag line ' + line)))
      }
      res['message'] = lines.slice(line + 1).join('\n')
      break
    }

    let key = m[1]
    let value = m[2]
    switch (key) {
      case 'object':
        res['object'] = gitUtil.shaToCid(new Buffer(value, 'hex'))
        break
      case 'tagger':
        res['tagger'] = gitUtil.parsePersonLine(value)
        break
      default:
        res[key] = value
    }
  }

  setImmediate(() => callback(null, res))
}
