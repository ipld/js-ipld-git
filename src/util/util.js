'use strict'

const multihash = require('multihashing-async').multihash
const CID = require('cids')
const strftime = require('strftime')

exports = module.exports

exports.SHA1_LENGTH = 20

exports.find = (buf, byte) => {
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === byte) {
      return i
    }
  }
  return -1
}

const ISO_8601_STRICT = '%FT%T%:z'
const TIMESTAMP_WITH_OFFSET = '%s %z'

const timestampWithOffsetToISOStrict = (timestamp, offset) => strftime.timezone(offset)(ISO_8601_STRICT, new Date(timestamp * 1000))

const isoStrictToTimestampWithOffset = (isoString) => {
  const matched = isoString.match(/([+-]\d{2}:\d{2})/)
  const offset = matched === null ? '+0000' : (matched[0].slice(0, 3) + matched[0].slice(4))
  return strftime.timezone(offset)(TIMESTAMP_WITH_OFFSET, new Date(isoString))
}

exports.parsePersonLine = (line) => {
  const matched = line.match(/^(([^<]+)\s)?\s?<([^>]+)>\s?(?:(\d+)\s([+-]\d+))?$/)
  if (matched === null) {
    return null
  }

  return {
    name: matched[2],
    email: matched[3],
    date: matched[4] && matched[5] && timestampWithOffsetToISOStrict(parseInt(matched[4]), matched[5])
  }
}

exports.serializePersonLine = (node) => {
  const parts = []
  if (node.name) {
    parts.push(node.name)
  }
  parts.push('<' + node.email + '>')
  if (node.date) {
    parts.push(isoStrictToTimestampWithOffset(node.date))
  }

  return parts.join(' ')
}

exports.shaToCid = (buf) => {
  const mh = multihash.encode(buf, 'sha1')
  return new CID(1, 'git-raw', mh)
}

exports.cidToSha = (cid) => {
  const mh = multihash.decode(cid.multihash)
  if (mh.name !== 'sha1') {
    return null
  }

  return mh.digest
}
