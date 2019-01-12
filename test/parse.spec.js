/* eslint-env mocha */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const loadFixture = require('aegir/fixtures')
const zlib = require('zlib')
const ipldGit = require('../src')
const util = require('../src/util/util')

const testObjectsJSON = require('./fixtures/objects.json')

describe('utils', () => {
  describe('person line parsing', () => {
    it('parses generic line', async () => {
      let info = util.parsePersonLine('Someone <some@one.somewhere> 123456 +0123')
      expect(info).to.exist()
      expect(info.name).to.equal('Someone')
      expect(info.email).to.equal('some@one.somewhere')
      expect(info.date).to.equal('123456 +0123')
    })

    it('parses 3 segment name', async () => {
      let info = util.parsePersonLine('So Me One <some@one.somewhere> 123456 +0123')
      expect(info).to.exist()
      expect(info.name).to.equal('So Me One')
      expect(info.email).to.equal('some@one.somewhere')
      expect(info.date).to.equal('123456 +0123')
    })

    it('parses no name line', async () => {
      let info = util.parsePersonLine('<some@one.somewhere> 123456 +0123')
      expect(info).to.exist()
      expect(info.name).to.not.exist()
      expect(info.email).to.equal('some@one.somewhere')
      expect(info.date).to.equal('123456 +0123')
    })

    it('parses no name line with space in front', async () => {
      let info = util.parsePersonLine(' <some@one.somewhere> 123456 +0123')
      expect(info).to.exist()
      expect(info.name).to.not.exist()
      expect(info.email).to.equal('some@one.somewhere')
      expect(info.date).to.equal('123456 +0123')
    })

    it('parses line with nonstandard info', async () => {
      let info = util.parsePersonLine('Some One & Other One <some@one.somewhere, other@one.elsewhere> 987654 +4321')
      expect(info).to.exist()
      expect(info.name).to.equal('Some One & Other One')
      expect(info.email).to.equal('some@one.somewhere, other@one.elsewhere')
      expect(info.date).to.equal('987654 +4321')
    })

    it('parses line without date info', async () => {
      let info = util.parsePersonLine('Someone <some.one@some.where>')
      expect(info).to.exist()
      expect(info.name).to.equal('Someone')
      expect(info.email).to.equal('some.one@some.where')
      expect(info.date).to.not.exist()
    })
  })
})

describe('git object parsing', () => {
  let objects

  before(() => {
    objects = testObjectsJSON.map(o => [o, zlib.inflateSync(loadFixture('test/fixtures/' + o))])
  })

  it('is parsing and serializing properly', async () => {
    for (const object of objects) {
      const node = await ipldGit.util.deserialize(object[1])
      expect(node).to.exist()

      let expCid = util.shaToCid(Buffer.from(object[0], 'hex'))

      const cid = await ipldGit.util.cid(node)
      expect(cid).to.exist()

      expect(cid.buffer.toString('hex')).to.equal(expCid.toString('hex'), 'expected ' +
        object[0] + ', got ' + cid.toBaseEncodedString('base16') + ', objtype ' +
        node._objtype + ', blob:' + Buffer.isBuffer(node))
    }
  })
})
