/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const CID = require('cids')
const ipldGit = require('../src')
const resolver = ipldGit.resolver

describe('IPLD format resolver (local)', () => {
  let commitBlob
  let tagBlob
  let treeBlob
  let blobBlob

  before(async () => {
    const commitNode = {
      gitType: 'commit',
      tree: { '/': new CID('z8mWaJ1dZ9fH5EetPuRsj8jj26pXsgpsr').buffer },
      parents: [
        { '/': new CID('z8mWaFY1zpiZSXTBrz8i6A3o9vNvAs2CH').buffer }
      ],
      author: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        date: '1497302532 +0200'
      },
      committer: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        date: '1497302532 +0200'
      },
      encoding: 'ISO-8859-1',
      message: 'Encoded\n'
    }

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

    const treeNode = {
      somefile: {
        hash: { '/': new CID('z8mWaJNVTadD7oum3m7f1dmarHvYhFV5b').buffer },
        mode: '100644'
      },
      somedir: {
        hash: { '/': new CID('z8mWaFY1zpiZSXTBrz8i6A3o9vNvAs2CH').buffer },
        mode: '40000'
      }
    }

    const blobNode = Buffer.from('626c6f62203800736f6d6564617461', 'hex') // blob 8\0somedata
    const blocks = await Promise.all([
      ipldGit.util.serialize(commitNode),
      ipldGit.util.serialize(tagNode),
      ipldGit.util.serialize(treeNode),
      ipldGit.util.serialize(blobNode)
    ])
    commitBlob = blocks[0]
    tagBlob = blocks[1]
    treeBlob = blocks[2]
    blobBlob = blocks[3]
  })

  describe('commit', () => {
    it('resolver.tree', async () => {
      const paths = await resolver.tree(commitBlob)
      expect(paths).to.eql([
        'message',
        'tree',
        'author/original',
        'author/name',
        'author/email',
        'author/date',
        'committer/original',
        'committer/name',
        'committer/email',
        'committer/date',
        'parents/0',
        'encoding'
      ])
    })

    it('resolver.isLink with valid Link', async () => {
      const link = await resolver.isLink(commitBlob, 'tree')
      const linkCID = new CID(link['/'])
      expect(CID.isCID(linkCID)).to.equal(true)
    })

    it('resolver.isLink with invalid Link', async () => {
      const link = await resolver.isLink(commitBlob, '')
      expect(link).to.equal(false)
    })

    describe('resolver.resolve', () => {
      it('path within scope', async () => {
        const result = await resolver.resolve(commitBlob, 'message')
        expect(result.value).to.equal('Encoded\n')
      })

      it('path within scope, but nested', async () => {
        const result = await resolver.resolve(commitBlob, 'author/name')
        expect(result.value).to.equal('John Doe')
      })

      it('path out of scope', async () => {
        const result = await resolver.resolve(commitBlob, 'tree/foo/hash/bar/mode')
        expect(result.value).to.eql({
          '/': new CID('z8mWaJ1dZ9fH5EetPuRsj8jj26pXsgpsr').buffer
        })
        expect(result.remainderPath).to.equal('foo/hash/bar/mode')
      })
    })
  })

  describe('tag', () => {
    it('resolver.tree', async () => {
      const paths = await resolver.tree(tagBlob)
      expect(paths).to.eql([
        'object',
        'type',
        'tag',
        'message',
        'tagger/original',
        'tagger/name',
        'tagger/email',
        'tagger/date'
      ])
    })

    it('resolver.isLink with valid Link', async () => {
      const link = await resolver.isLink(tagBlob, 'object')
      const linkCID = new CID(link['/'])
      expect(CID.isCID(linkCID)).to.equal(true)
    })
  })

  it('resolver.isLink with invalid Link', async () => {
    const link = await resolver.isLink(tagBlob, '')
    expect(link).to.equal(false)
  })

  describe('resolver.resolve', () => {
    it('path within scope', async () => {
      const result = await resolver.resolve(tagBlob, 'message')
      expect(result.value).to.equal('A message\n')
    })

    it('path within scope, but nested', async () => {
      const result = await resolver.resolve(tagBlob, 'tagger/name')
      expect(result.value).to.equal('John Doe')
    })

    it('path out of scope', async () => {
      const result = await resolver.resolve(tagBlob, 'object/tree/foo/mode')
      expect(result.value).to.eql({
        '/': new CID('z8mWaHQaEAKd5KMRNU3npB3saSZmhFh3e').buffer
      })
      expect(result.remainderPath).to.equal('tree/foo/mode')
    })
  })

  describe('tree', () => {
    it('resolver.tree', async () => {
      const paths = await resolver.tree(treeBlob)
      expect(paths).to.eql([
        'somedir',
        'somedir/hash',
        'somedir/mode',
        'somefile',
        'somefile/hash',
        'somefile/mode'
      ])
    })

    it('resolver.isLink with valid Link', async () => {
      const link = await resolver.isLink(treeBlob, 'somefile/hash')
      const linkCID = new CID(link['/'])
      expect(CID.isCID(linkCID)).to.equal(true)
    })

    it('resolver.isLink with invalid Link', async () => {
      const link = await resolver.isLink(treeBlob, '')
      expect(link).to.equal(false)
    })

    describe('resolver.resolve', () => {
      it('path within scope, nested', async () => {
        const result = await resolver.resolve(treeBlob, 'somedir/mode')
        expect(result.value).to.equal('40000')
      })

      it('path out of scope', async () => {
        const result = await resolver.resolve(treeBlob, 'somedir/hash/subfile/mode')
        expect(result.value).to.eql({
          '/': new CID('z8mWaFY1zpiZSXTBrz8i6A3o9vNvAs2CH').buffer
        })
        expect(result.remainderPath).to.equal('subfile/mode')
      })
    })
  })

  describe('blob', () => {
    it('resolver.tree', async () => {
      const paths = await resolver.tree(blobBlob)
      expect(paths).to.eql([])
    })

    it('resolver.isLink with invalid Link', async () => {
      const link = await resolver.isLink(treeBlob, '')
      expect(link).to.equal(false)
    })
  })

  describe('IPLD format resolver API properties', () => {
    it('should have `multicodec` defined correctly', async () => {
      expect(resolver.multicodec).to.equal('git-raw')
    })

    it('should have `defaultHashAlg` defined correctly', async () => {
      expect(resolver.defaultHashAlg).to.equal('sha1')
    })
  })
})
