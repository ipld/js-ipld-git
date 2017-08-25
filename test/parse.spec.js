/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

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
    it('parses generic line', (done) => {
      let info = util.parsePersonLine('Someone <some@one.somewhere> 123456 +0123')
      expect(info).to.exist()
      expect(info.name).to.equal('Someone')
      expect(info.email).to.equal('some@one.somewhere')
      expect(info.date).to.equal('123456')
      expect(info.timezone).to.equal('+0123')
      done()
    })

    it('parses 3 segment name', (done) => {
      let info = util.parsePersonLine('So Me One <some@one.somewhere> 123456 +0123')
      expect(info).to.exist()
      expect(info.name).to.equal('So Me One')
      expect(info.email).to.equal('some@one.somewhere')
      expect(info.date).to.equal('123456')
      expect(info.timezone).to.equal('+0123')
      done()
    })

    it('parses no name line', (done) => {
      let info = util.parsePersonLine('<some@one.somewhere> 123456 +0123')
      expect(info).to.exist()
      expect(info.name).to.not.exist()
      expect(info.email).to.equal('some@one.somewhere')
      expect(info.date).to.equal('123456')
      expect(info.timezone).to.equal('+0123')
      done()
    })

    it('parses no name line with space in front', (done) => {
      let info = util.parsePersonLine(' <some@one.somewhere> 123456 +0123')
      expect(info).to.exist()
      expect(info.name).to.not.exist()
      expect(info.email).to.equal('some@one.somewhere')
      expect(info.date).to.equal('123456')
      expect(info.timezone).to.equal('+0123')
      done()
    })

    it('parses line with nonstandard info', (done) => {
      let info = util.parsePersonLine('Some One & Other One <some@one.somewhere, other@one.elsewhere> 987654 +4321')
      expect(info).to.exist()
      expect(info.name).to.equal('Some One & Other One')
      expect(info.email).to.equal('some@one.somewhere, other@one.elsewhere')
      expect(info.date).to.equal('987654')
      expect(info.timezone).to.equal('+4321')
      done()
    })

    it('parses line without date info', (done) => {
      let info = util.parsePersonLine('Someone <some.one@some.where>')
      expect(info).to.exist()
      expect(info.name).to.equal('Someone')
      expect(info.email).to.equal('some.one@some.where')
      expect(info.date).to.not.exist()
      expect(info.timezone).to.not.exist()
      done()
    })
  })
})

describe('git object parsing', () => {
  let objects

  before((done) => {
    objects = testObjectsJSON.map(o => [o, zlib.inflateSync(loadFixture(__dirname, '/fixtures/' + o))])
    done()
  })

  it('is parsing and serializing properly', (done) => {
    objects.forEach(function (object) {
      ipldGit.util.deserialize(object[1], (err, node) => {
        expect(err).to.not.exist()
      })
    })
    done()
  })
})
