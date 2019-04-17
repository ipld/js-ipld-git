/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const multicodec = require('multicodec')

const mod = require('../src')

describe('IPLD Format', () => {
  it('codec is git-raw', () => {
    expect(mod.codec).to.equal(multicodec.GIT_RAW)
  })

  it('defaultHashAlg is sha1', () => {
    expect(mod.defaultHashAlg).to.equal(multicodec.SHA1)
  })
})
