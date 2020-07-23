/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const { Buffer } = require('buffer')

const CID = require('cids')

const ipldGit = require('../src')
const resolver = ipldGit.resolver

describe('IPLD format resolver (local)', () => {
  let commitBlob
  let tagBlob
  let treeBlob
  let blobBlob

  before((done) => {
    const commitNode = {
      gitType: 'commit',
      tree: new CID('z8mWaJ1dZ9fH5EetPuRsj8jj26pXsgpsr'),
      parents: [
        new CID('z8mWaFY1zpiZSXTBrz8i6A3o9vNvAs2CH')
      ],
      author: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        date: '2017-06-12T23:22:12+02:00'
      },
      committer: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        date: '2017-06-12T23:22:12+02:00'
      },
      encoding: 'ISO-8859-1',
      message: 'Encoded\n'
    }

    const tagNode = {
      gitType: 'tag',
      object: new CID('z8mWaHQaEAKd5KMRNU3npB3saSZmhFh3e'),
      type: 'commit',
      tag: 'v0.0.0',
      tagger: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        date: '2017-06-12T23:22:12+02:00'
      },
      message: 'A message\n'
    }

    const treeNode = {
      somefile: {
        hash: new CID('z8mWaJNVTadD7oum3m7f1dmarHvYhFV5b'),
        mode: '100644'
      },
      somedir: {
        hash: new CID('z8mWaFY1zpiZSXTBrz8i6A3o9vNvAs2CH'),
        mode: '40000'
      }
    }
    treeNode['somedir.notactuallyadir'] = {
      hash: new CID('z8mWaJNVTadD7oum3m7f1dmarHvYhFV5b'),
      mode: '100644'
    }
    treeNode['somefile.notactuallyafile'] = {
      hash: new CID('z8mWaFY1zpiZSXTBrz8i6A3o9vNvAs2CH'),
      mode: '40000'
    }

    const blobNode = Buffer.from('626c6f62203800736f6d6564617461', 'hex') // blob 8\0somedata

    commitBlob = ipldGit.util.serialize(commitNode)
    tagBlob = ipldGit.util.serialize(tagNode)
    treeBlob = ipldGit.util.serialize(treeNode)
    blobBlob = ipldGit.util.serialize(blobNode)
    done()
  })

  describe('commit', () => {
    it('resolver.tree', () => {
      const tree = resolver.tree(commitBlob)
      const paths = [...tree]

      expect(paths).to.have.members([
        'message',
        'tree',
        'author',
        'author/name',
        'author/email',
        'author/date',
        'committer',
        'committer/name',
        'committer/email',
        'committer/date',
        'parents',
        'parents/0',
        'encoding'
      ])
    })

    describe('resolver.resolve', () => {
      it('path within scope', () => {
        const result = resolver.resolve(commitBlob, 'message')
        expect(result.value).to.equal('Encoded\n')
      })

      it('path within scope, but nested', () => {
        const result = resolver.resolve(commitBlob, 'author/name')
        expect(result.value).to.equal('John Doe')
      })

      it('path out of scope', () => {
        const result = resolver.resolve(commitBlob, 'tree/foo/hash/bar/mode')
        expect(result.value.equals(
          new CID('z8mWaJ1dZ9fH5EetPuRsj8jj26pXsgpsr'))
        ).to.be.true()
        expect(result.remainderPath).to.equal('foo/hash/bar/mode')
      })
    })
  })

  describe('tag', () => {
    it('resolver.tree', () => {
      const tree = resolver.tree(tagBlob)
      const paths = [...tree]

      expect(paths).to.have.members([
        'object',
        'type',
        'tag',
        'message',
        'tagger',
        'tagger/name',
        'tagger/email',
        'tagger/date'
      ])
    })

    describe('resolver.resolve', () => {
      it('path within scope', () => {
        const result = resolver.resolve(tagBlob, 'message')
        expect(result.value).to.equal('A message\n')
      })

      it('path within scope, but nested', () => {
        const result = resolver.resolve(tagBlob, 'tagger/name')
        expect(result.value).to.equal('John Doe')
      })

      it('path out of scope', () => {
        const result = resolver.resolve(tagBlob, 'object/tree/foo/mode')
        expect(result.value.equals(
          new CID('z8mWaHQaEAKd5KMRNU3npB3saSZmhFh3e')
        )).to.be.true()
        expect(result.remainderPath).to.equal('tree/foo/mode')
      })
    })
  })

  describe('tree', () => {
    it('resolver.tree', () => {
      const tree = resolver.tree(treeBlob)
      const paths = [...tree]

      expect(paths).to.have.members([
        'somedir.notactuallyadir',
        'somedir.notactuallyadir/hash',
        'somedir.notactuallyadir/mode',
        'somedir',
        'somedir/hash',
        'somedir/mode',
        'somefile',
        'somefile/hash',
        'somefile/mode',
        'somefile.notactuallyafile',
        'somefile.notactuallyafile/hash',
        'somefile.notactuallyafile/mode'
      ])
    })

    describe('resolver.resolve', () => {
      it('path within scope, nested', () => {
        const result = resolver.resolve(treeBlob, 'somedir/mode')
        expect(result.value).to.equal('40000')
      })

      it('path out of scope', () => {
        const result = resolver.resolve(treeBlob, 'somedir/hash/subfile/mode')
        expect(result.value.equals(
          new CID('z8mWaFY1zpiZSXTBrz8i6A3o9vNvAs2CH')
        )).to.be.true()
        expect(result.remainderPath).to.equal('subfile/mode')
      })
    })
  })

  describe('blob', () => {
    it('resolver.tree', () => {
      const paths = resolver.tree(blobBlob).next()
      expect(paths.value).to.be.undefined()
      expect(paths.done).to.be.true()
    })
  })
})
