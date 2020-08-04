/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
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
