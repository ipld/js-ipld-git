/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const { Buffer } = require('buffer')
const loadFixture = require('aegir/fixtures')
const zlib = require('zlib')
const ipldGit = require('../src')
const util = require('../src/util/util')

const testObjectsJSON = require('./fixtures/objects.json')

describe('utils', () => {
  describe('person line parsing', () => {
    it('parses generic line', (done) => {
      const info = util.parsePersonLine('Someone <some@one.somewhere> 123456 +0123')
      expect(info).to.exist()
      expect(info.name).to.equal('Someone')
      expect(info.email).to.equal('some@one.somewhere')
      expect(info.date).to.equal('1970-01-02T11:40:36+01:23')
      done()
    })

    it('parses 3 segment name', (done) => {
      const info = util.parsePersonLine('So Me One <some@one.somewhere> 123456 +0123')
      expect(info).to.exist()
      expect(info.name).to.equal('So Me One')
      expect(info.email).to.equal('some@one.somewhere')
      expect(info.date).to.equal('1970-01-02T11:40:36+01:23')
      done()
    })

    it('parses no name line', (done) => {
      const info = util.parsePersonLine('<some@one.somewhere> 123456 +0123')
      expect(info).to.exist()
      expect(info.name).to.not.exist()
      expect(info.email).to.equal('some@one.somewhere')
      expect(info.date).to.equal('1970-01-02T11:40:36+01:23')
      done()
    })

    it('parses no name line with space in front', (done) => {
      const info = util.parsePersonLine(' <some@one.somewhere> 123456 +0123')
      expect(info).to.exist()
      expect(info.name).to.not.exist()
      expect(info.email).to.equal('some@one.somewhere')
      expect(info.date).to.equal('1970-01-02T11:40:36+01:23')
      done()
    })

    it('parses line with nonstandard info', (done) => {
      const info = util.parsePersonLine('Some One & Other One <some@one.somewhere, other@one.elsewhere> 987654 +4321')
      expect(info).to.exist()
      expect(info.name).to.equal('Some One & Other One')
      expect(info.email).to.equal('some@one.somewhere, other@one.elsewhere')
      expect(info.date).to.equal('1970-01-14T05:41:54+43:21')
      done()
    })

    it('parses line without date info', (done) => {
      const info = util.parsePersonLine('Someone <some.one@some.where>')
      expect(info).to.exist()
      expect(info.name).to.equal('Someone')
      expect(info.email).to.equal('some.one@some.where')
      expect(info.date).to.not.exist()
      done()
    })
  })
})

describe('git object parsing', () => {
  const objects = testObjectsJSON.map(
    (o) => [o, zlib.inflateSync(loadFixture('test/fixtures/' + o))]
  )

  it('is parsing and serializing properly', async () => {
    for (const object of objects) {
      const expCid = util.shaToCid(Buffer.from(object[0], 'hex'))

      const cid = await ipldGit.util.cid(object[1])
      expect(cid.equals(expCid)).to.be.true()
    }
  })
})
