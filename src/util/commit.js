'use strict'

const SmartBuffer = require('smart-buffer').SmartBuffer
const { Buffer } = require('buffer')
const gitUtil = require('./util')

exports = module.exports

exports.serialize = (dagNode) => {
  const lines = []
  lines.push('tree ' + gitUtil.cidToSha(dagNode.tree).toString('hex'))
  dagNode.parents.forEach((parent) => {
    lines.push('parent ' + gitUtil.cidToSha(parent).toString('hex'))
  })
  lines.push('author ' + gitUtil.serializePersonLine(dagNode.author))
  lines.push('committer ' + gitUtil.serializePersonLine(dagNode.committer))
  if (dagNode.encoding) {
    lines.push('encoding ' + dagNode.encoding)
  }
  if (dagNode.mergetag) {
    dagNode.mergetag.forEach(tag => {
      lines.push('mergetag object ' + gitUtil.cidToSha(tag.object).toString('hex'))
      lines.push(tag.text)
    })
  }
  if (dagNode.signature) {
    lines.push('gpgsig -----BEGIN PGP SIGNATURE-----')
    lines.push(dagNode.signature.text)
  }
  lines.push('')
  lines.push(dagNode.message)

  const data = lines.join('\n')

  const outBuf = new SmartBuffer()
  outBuf.writeString('commit ')
  outBuf.writeString(data.length.toString())
  outBuf.writeUInt8(0)
  outBuf.writeString(data)
  return outBuf.toBuffer()
}

exports.deserialize = (data) => {
  const lines = data.toString().split('\n')
  const res = { gitType: 'commit', parents: [] }

  for (let line = 0; line < lines.length; line++) {
    const m = lines[line].match(/^([^ ]+) (.+)$/)
    if (!m) {
      if (lines[line] !== '') {
        throw new Error('Invalid commit line ' + line)
      }
      res.message = lines.slice(line + 1).join('\n')
      break
    }

    const key = m[1]
    const value = m[2]
    switch (key) {
      case 'tree':
        res.tree = gitUtil.shaToCid(Buffer.from(value, 'hex'))
        break
      case 'committer':
        res.committer = gitUtil.parsePersonLine(value)
        break
      case 'author':
        res.author = gitUtil.parsePersonLine(value)
        break
      case 'parent':
        res.parents.push(gitUtil.shaToCid(Buffer.from(value, 'hex')))
        break
      case 'gpgsig': {
        if (value !== '-----BEGIN PGP SIGNATURE-----') {
          throw new Error('Invalid commit line ' + line)
        }
        res.signature = {}

        const startLine = line
        for (; line < lines.length - 1; line++) {
          if (lines[line + 1][0] !== ' ') {
            res.signature.text = lines.slice(startLine + 1, line + 1).join('\n')
            break
          }
        }
        break
      }
      case 'mergetag': {
        const mt = value.match(/^object ([0-9a-f]{40})$/)
        if (!mt) {
          throw new Error('Invalid commit line ' + line)
        }

        const tag = { object: gitUtil.shaToCid(Buffer.from(mt[1], 'hex')) }

        const startLine = line
        for (; line < lines.length - 1; line++) {
          if (lines[line + 1][0] !== ' ') {
            tag.text = lines.slice(startLine + 1, line + 1).join('\n')
            break
          }
        }

        if (!res.mergetag) {
          res.mergetag = []
        }

        res.mergetag.push(tag)
      }

        break
      default:
        res[key] = value
    }
  }

  Object.defineProperty(res, 'gitType', { enumerable: false })

  return res
}
