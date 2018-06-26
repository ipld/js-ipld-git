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
    object: {'/': new CID('z8mWaHQaEAKd5KMRNU3npB3saSZmhFh3e').buffer},
    type: 'commit',
    tag: 'v0.0.0',
    tagger: {
      name: 'John Doe',
      email: 'johndoe@example.com',
      date: '1497302532 +0200'
    },
    message: 'A message\n'
  }
  let tagNodeSerialized

  it('.serialize and .deserialize', (done) => {
    ipldGit.util.serialize(tagNode, (err, serialized) => {
      expect(err).to.not.exist()
      expect(Buffer.isBuffer(serialized)).to.equal(true)
      tagNodeSerialized = serialized
      ipldGit.util.deserialize(serialized, (err, deserialized) => {
        expect(err).to.not.exist()
        expect(tagNode).to.eql(deserialized)
        done()
      })
    })
  })

  it('.cid', (done) => {
    ipldGit.util.cid(tagNodeSerialized, (err, cid) => {
      expect(err).to.not.exist()
      expect(cid.version).to.equal(1)
      expect(cid.codec).to.equal('git-raw')
      expect(cid.multihash).to.exist()
      const mh = multihash.decode(cid.multihash)
      expect(mh.name).to.equal('sha1')
      done()
    })
  })

  it('.cid ignores options', (done) => {
    ipldGit.util.cid(tagNodeSerialized, { hashAlg: 'unknown' }, (err, cid) => {
      expect(err).to.not.exist()
      expect(cid.version).to.equal(1)
      expect(cid.codec).to.equal('git-raw')
      expect(cid.multihash).to.exist()
      const mh = multihash.decode(cid.multihash)
      expect(mh.name).to.equal('sha1')
      done()
    })
  })
})
