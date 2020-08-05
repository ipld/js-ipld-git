/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const ipldGit = require('../src')
const multicodec = require('multicodec')
const multihash = require('multihashing-async').multihash
const CID = require('cids')
const { Buffer } = require('buffer')
const uint8ArrayFromString = require('uint8arrays/from-string')

describe('IPLD format util', () => {
  const tagNode = {
    gitType: 'tag',
    object: new CID('baf4bcfe5cqe5giojiciib5mci7gbb53xcxqot2i'),
    type: 'commit',
    tag: 'v0.0.0',
    tagger: {
      name: 'John Doe',
      email: 'johndoe@example.com',
      date: '2017-06-12T23:22:12+02:00'
    },
    message: 'A message\n'
  }
  const tagBlob = ipldGit.util.serialize(tagNode)

  it('.serialize from Uint8Array', () => {
    const node = uint8ArrayFromString('blob-blob')
    const blob = ipldGit.util.serialize(node)

    expect(blob).to.deep.equal(node)
  })

  it('.serialize from tree', () => {
    const node = {
      'file.txt': {
        hash: new CID('baf4bcfe5cqe5giojiciib5mci7gbb53xcxqot2i'),
        mode: '644'
      }
    }
    const blob = ipldGit.util.serialize(node)
    const deserialized = ipldGit.util.deserialize(blob)

    expect(deserialized).to.deep.equal(node)
  })

  it('.serialize and .deserialize', () => {
    expect(Buffer.isBuffer(tagBlob)).to.be.true()
    const deserialized = ipldGit.util.deserialize(tagBlob)

    // The `gitType` is not enumerable, hence `eql()` would find it. Thus
    // remove that property so that that check passes
    const expected = Object.assign({}, tagNode)
    delete expected.gitType
    expect(deserialized).to.eql(expected)
  })

  it('.serialize and .deserialize Uint8Array', () => {
    expect(Buffer.isBuffer(Uint8Array.of(...tagBlob))).to.be.false()
    const deserialized = ipldGit.util.deserialize(Uint8Array.of(...tagBlob))

    // The `gitType` is not enumerable, hence `eql()` would find it. Thus
    // remove that property so that that check passes
    const expected = Object.assign({}, tagNode)
    delete expected.gitType
    expect(deserialized).to.eql(expected)
  })

  it('.cid', async () => {
    const cid = await ipldGit.util.cid(tagBlob)
    expect(cid.version).to.equal(1)
    expect(cid.codec).to.equal('git-raw')
    expect(cid.multihash).to.exist()
    const mh = multihash.decode(cid.multihash)
    expect(mh.name).to.equal('sha1')
  })

  it('.cid with options', async () => {
    const cid = await ipldGit.util.cid(tagBlob, {
      hashAlg: multicodec.SHA3_512
    })
    expect(cid.version).to.equal(1)
    expect(cid.codec).to.equal('git-raw')
    expect(cid.multihash).to.exist()
    const mh = multihash.decode(cid.multihash)
    expect(mh.name).to.equal('sha3-512')
  })

  it('.cid errors unknown hashAlg', async () => {
    await expect(ipldGit.util.cid(tagNode, { hashAlg: 0xffffff }
    )).to.be.rejectedWith('Unrecognized function code: 16777215')
  })
})
