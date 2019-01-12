/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const ipldGit = require('../src')
const multihash = require('multihashes')
const CID = require('cids')

describe('IPLD format util', () => {
  const tagNode = {
    gitType: 'tag',
    object: { '/': new CID('z8mWaHQaEAKd5KMRNU3npB3saSZmhFh3e').buffer },
    type: 'commit',
    tag: 'v0.0.0',
    tagger: {
      name: 'John Doe',
      email: 'johndoe@example.com',
      date: '1497302532 +0200'
    },
    message: 'A message\n'
  }

  it('.serialize and .deserialize', async () => {
    const serialized = await ipldGit.util.serialize(tagNode)
    expect(Buffer.isBuffer(serialized)).to.equal(true)
    const deserialized = await ipldGit.util.deserialize(serialized)
    expect(tagNode).to.eql(deserialized)
  })

  it('.cid', async () => {
    const cid = await ipldGit.util.cid(tagNode)
    expect(cid.version).to.equal(1)
    expect(cid.codec).to.equal('git-raw')
    expect(cid.multihash).to.exist()
    const mh = multihash.decode(cid.multihash)
    expect(mh.name).to.equal('sha1')
  })

  it('.cid with options', async () => {
    const cid = await ipldGit.util.cid(tagNode, { hashAlg: 'sha3-512' })
    expect(cid.version).to.equal(1)
    expect(cid.codec).to.equal('git-raw')
    expect(cid.multihash).to.exist()
    const mh = multihash.decode(cid.multihash)
    expect(mh.name).to.equal('sha3-512')
  })

  it('.cid errors unknown hashAlg', async () => {
    try {
      await ipldGit.util.cid(tagNode, { hashAlg: 'unknown' })
    } catch (err) {
      expect(err).to.exist()
      return
    }
    throw new Error('Error did not exist')
  })
})
