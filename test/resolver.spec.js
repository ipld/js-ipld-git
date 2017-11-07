/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const Block = require('ipfs-block')
const map = require('async/map')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const CID = require('cids')
const multihashing = require('multihashing-async')

const ipldGit = require('../src')
const resolver = ipldGit.resolver

describe('IPLD format resolver (local)', () => {
  let commitBlock
  let tagBlock
  let treeBlock
  let blobBlock

  before((done) => {
    const commitNode = {
      gitType: 'commit',
      tree: {'/': new CID('z8mWaJ1dZ9fH5EetPuRsj8jj26pXsgpsr').buffer},
      parents: [
        {'/': new CID('z8mWaFY1zpiZSXTBrz8i6A3o9vNvAs2CH').buffer}
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

    const treeNode = {
      somefile: {
        hash: {'/': new CID('z8mWaJNVTadD7oum3m7f1dmarHvYhFV5b').buffer},
        mode: '100644'
      },
      somedir: {
        hash: {'/': new CID('z8mWaFY1zpiZSXTBrz8i6A3o9vNvAs2CH').buffer},
        mode: '40000'
      }
    }

    const blobNode = Buffer.from('626c6f62203800736f6d6564617461', 'hex') // blob 8\0somedata

    waterfall([
      (cb) => parallel([
        (cb) => ipldGit.util.serialize(commitNode, cb),
        (cb) => ipldGit.util.serialize(tagNode, cb),
        (cb) => ipldGit.util.serialize(treeNode, cb),
        (cb) => ipldGit.util.serialize(blobNode, cb)
      ], cb),
      (res, cb) => map(res, (s, cb) => {
        multihashing(s, 'sha1', (err, multihash) => {
          expect(err).to.not.exist()
          cb(null, new Block(s, new CID(multihash)))
        })
      }, cb),
      (blocks, cb) => {
        commitBlock = blocks[0]
        tagBlock = blocks[1]
        treeBlock = blocks[2]
        blobBlock = blocks[3]
        cb()
      }
    ], done)
  })

  describe('commit', () => {
    it('resolver.tree', (done) => {
      resolver.tree(commitBlock, (err, paths) => {
        expect(err).to.not.exist()

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

        done()
      })
    })

    it('resolver.isLink with valid Link', (done) => {
      resolver.isLink(commitBlock, 'tree', (err, link) => {
        expect(err).to.not.exist()
        const linkCID = new CID(link['/'])
        expect(CID.isCID(linkCID)).to.equal(true)
        done()
      })
    })

    it('resolver.isLink with invalid Link', (done) => {
      resolver.isLink(commitBlock, '', (err, link) => {
        expect(err).to.not.exist()
        expect(link).to.equal(false)
        done()
      })
    })

    describe('resolver.resolve', () => {
      it('path within scope', (done) => {
        resolver.resolve(commitBlock, 'message', (err, result) => {
          expect(err).to.not.exist()
          expect(result.value).to.equal('Encoded\n')
          done()
        })
      })

      it('path within scope, but nested', (done) => {
        resolver.resolve(commitBlock, 'author/name', (err, result) => {
          expect(err).to.not.exist()
          expect(result.value).to.equal('John Doe')
          done()
        })
      })

      it('path out of scope', (done) => {
        resolver.resolve(commitBlock, 'tree/foo/hash/bar/mode', (err, result) => {
          expect(err).to.not.exist()
          expect(result.value).to.eql({
            '/': new CID('z8mWaJ1dZ9fH5EetPuRsj8jj26pXsgpsr').buffer
          })
          expect(result.remainderPath).to.equal('foo/hash/bar/mode')
          done()
        })
      })
    })
  })

  describe('tag', () => {
    it('resolver.tree', (done) => {
      resolver.tree(tagBlock, (err, paths) => {
        expect(err).to.not.exist()

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

        done()
      })
    })

    it('resolver.isLink with valid Link', (done) => {
      resolver.isLink(tagBlock, 'object', (err, link) => {
        expect(err).to.not.exist()
        const linkCID = new CID(link['/'])
        expect(CID.isCID(linkCID)).to.equal(true)
        done()
      })
    })

    it('resolver.isLink with invalid Link', (done) => {
      resolver.isLink(tagBlock, '', (err, link) => {
        expect(err).to.not.exist()
        expect(link).to.equal(false)
        done()
      })
    })

    describe('resolver.resolve', () => {
      it('path within scope', (done) => {
        resolver.resolve(tagBlock, 'message', (err, result) => {
          expect(err).to.not.exist()
          expect(result.value).to.equal('A message\n')
          done()
        })
      })

      it('path within scope, but nested', (done) => {
        resolver.resolve(tagBlock, 'tagger/name', (err, result) => {
          expect(err).to.not.exist()
          expect(result.value).to.equal('John Doe')
          done()
        })
      })

      it('path out of scope', (done) => {
        resolver.resolve(tagBlock, 'object/tree/foo/mode', (err, result) => {
          expect(err).to.not.exist()
          expect(result.value).to.eql({
            '/': new CID('z8mWaHQaEAKd5KMRNU3npB3saSZmhFh3e').buffer
          })
          expect(result.remainderPath).to.equal('tree/foo/mode')
          done()
        })
      })
    })
  })

  describe('tree', () => {
    it('resolver.tree', (done) => {
      resolver.tree(treeBlock, (err, paths) => {
        expect(err).to.not.exist()

        expect(paths).to.eql([
          'somedir',
          'somedir/hash',
          'somedir/mode',
          'somefile',
          'somefile/hash',
          'somefile/mode'
        ])

        done()
      })
    })

    it('resolver.isLink with valid Link', (done) => {
      resolver.isLink(treeBlock, 'somefile/hash', (err, link) => {
        expect(err).to.not.exist()
        const linkCID = new CID(link['/'])
        expect(CID.isCID(linkCID)).to.equal(true)
        done()
      })
    })

    it('resolver.isLink with invalid Link', (done) => {
      resolver.isLink(treeBlock, '', (err, link) => {
        expect(err).to.not.exist()
        expect(link).to.equal(false)
        done()
      })
    })

    describe('resolver.resolve', () => {
      it('path within scope, nested', (done) => {
        resolver.resolve(treeBlock, 'somedir/mode', (err, result) => {
          expect(err).to.not.exist()
          expect(result.value).to.equal('40000')
          done()
        })
      })

      it('path out of scope', (done) => {
        resolver.resolve(treeBlock, 'somedir/hash/subfile/mode', (err, result) => {
          expect(err).to.not.exist()
          expect(result.value).to.eql({
            '/': new CID('z8mWaFY1zpiZSXTBrz8i6A3o9vNvAs2CH').buffer
          })
          expect(result.remainderPath).to.equal('subfile/mode')
          done()
        })
      })
    })
  })

  describe('blob', () => {
    it('resolver.tree', (done) => {
      resolver.tree(blobBlock, (err, paths) => {
        expect(err).to.not.exist()
        expect(paths).to.eql([])
        done()
      })
    })

    it('resolver.isLink with invalid Link', (done) => {
      resolver.isLink(treeBlock, '', (err, link) => {
        expect(err).to.not.exist()
        expect(link).to.equal(false)
        done()
      })
    })
  })
})
