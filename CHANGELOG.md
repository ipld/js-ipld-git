<a name="0.5.3"></a>
## [0.5.3](https://github.com/ipld/js-ipld-git/compare/v0.5.2...v0.5.3) (2020-07-24)



<a name="0.5.2"></a>
## [0.5.2](https://github.com/ipld/js-ipld-git/compare/v0.5.1...v0.5.2) (2020-06-19)


### Bug Fixes

* multihashes does not export default lengths any more ([4f85c53](https://github.com/ipld/js-ipld-git/commit/4f85c53)), closes [/github.com/multiformats/js-multihash/pull/76#issuecomment-646561123](https://github.com//github.com/multiformats/js-multihash/pull/76/issues/issuecomment-646561123)
* **package:** update cids to version 0.8.0 ([9da8893](https://github.com/ipld/js-ipld-git/commit/9da8893))



<a name="0.5.1"></a>
## [0.5.1](https://github.com/ipld/js-ipld-git/compare/v0.5.0...v0.5.1) (2020-01-13)


### Bug Fixes

* **package:** update multicodec to version 1.0.0 ([6dbc3c8](https://github.com/ipld/js-ipld-git/commit/6dbc3c8))
* **package:** update multihashing-async to version 0.8.0 ([fcf7f6f](https://github.com/ipld/js-ipld-git/commit/fcf7f6f))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/ipld/js-ipld-git/compare/v0.4.0...v0.5.0) (2019-05-10)


### Bug Fixes

* **package:** update cids to version 0.7.0 ([2d87c9e](https://github.com/ipld/js-ipld-git/commit/2d87c9e))


### BREAKING CHANGES

* **package:** Returned v1 CIDs now default to base32 encoding

Previous versions returned a base58 encoded string when `toString()`/
`toBaseEncodedString()` was called on a CIDv1. It now returns a base32
encoded string.



<a name="0.4.0"></a>
# [0.4.0](https://github.com/ipld/js-ipld-git/compare/v0.3.0...v0.4.0) (2019-05-08)


### Bug Fixes

* **package:** update cids to version 0.6.0 ([fe0ac8b](https://github.com/ipld/js-ipld-git/commit/fe0ac8b))
* **package:** update multihashing-async to version 0.6.0 ([784c464](https://github.com/ipld/js-ipld-git/commit/784c464))


### Features

* new IPLD Format API ([e39a7d9](https://github.com/ipld/js-ipld-git/commit/e39a7d9))


### BREAKING CHANGES

* The API is now async/await based

There are numerous changes, the most significant one is that the API
is no longer callback based, but it using async/await.

For the full new API please see the [IPLD Formats spec].

[IPLD Formats spec]: https://github.com/ipld/interface-ipld-format



<a name="0.3.0"></a>
# [0.3.0](https://github.com/ipld/js-ipld-git/compare/v0.2.3...v0.3.0) (2019-03-27)


### Bug Fixes

* order tree directory entries correctly (fixes [#44](https://github.com/ipld/js-ipld-git/issues/44)) ([02be41f](https://github.com/ipld/js-ipld-git/commit/02be41f))


### Features

* use RFC3339 to format dates, fixes ipfs/go-ipld-git[#16](https://github.com/ipld/js-ipld-git/issues/16) ([#43](https://github.com/ipld/js-ipld-git/issues/43)) ([8a9f7cb](https://github.com/ipld/js-ipld-git/commit/8a9f7cb))


### BREAKING CHANGES

* Dates are now returned in ISO 8601/RFC3399 format 



<a name="0.2.3"></a>
## [0.2.3](https://github.com/ipld/js-ipld-git/compare/v0.2.2...v0.2.3) (2019-01-18)


### Bug Fixes

* **package:** update multicodec to version 0.4.0 ([c370777](https://github.com/ipld/js-ipld-git/commit/c370777)), closes [#34](https://github.com/ipld/js-ipld-git/issues/34)
* browser bundle ([#39](https://github.com/ipld/js-ipld-git/issues/39)) ([d7d078f](https://github.com/ipld/js-ipld-git/commit/d7d078f))



<a name="0.2.2"></a>
## [0.2.2](https://github.com/ipld/js-ipld-git/compare/v0.2.1...v0.2.2) (2018-10-12)


### Features

* parse mergetags ([f2010df](https://github.com/ipld/js-ipld-git/commit/f2010df))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/ipld/js-ipld-git/compare/v0.2.0...v0.2.1) (2018-06-29)


### Bug Fixes

* do not ignore cid.options ([#18](https://github.com/ipld/js-ipld-git/issues/18)) ([4641b63](https://github.com/ipld/js-ipld-git/commit/4641b63))
* pass serialized blob to util.cid ([#16](https://github.com/ipld/js-ipld-git/issues/16)) ([d8f8687](https://github.com/ipld/js-ipld-git/commit/d8f8687))


### Features

* add defaultHashAlg ([d0ccec3](https://github.com/ipld/js-ipld-git/commit/d0ccec3))
* add util.cid options ([#15](https://github.com/ipld/js-ipld-git/issues/15)) ([5ed9c74](https://github.com/ipld/js-ipld-git/commit/5ed9c74))


### BREAKING CHANGES

* the first argument is now the serialized output NOT the dag node.
See https://github.com/ipld/interface-ipld-format/issues/32



<a name="0.2.0"></a>
# [0.2.0](https://github.com/ipld/js-ipld-git/compare/v0.1.1...v0.2.0) (2018-02-12)


### Bug Fixes

* use binary blobs directly ([334f2f0](https://github.com/ipld/js-ipld-git/commit/334f2f0))


### BREAKING CHANGES

* Everyone calling the functions of `resolve` need to
pass in the binary data instead of an IPFS block.

So if your input is an IPFS block, the code changes from

    resolver.resolve(block, path, (err, result) => {…}

to

    resolver.resolve(block.data, path, (err, result) => {…}



<a name="0.1.1"></a>
## [0.1.1](https://github.com/ipld/js-ipld-git/compare/v0.1.0...v0.1.1) (2017-11-07)


### Bug Fixes

* invalid signature parsing ([#6](https://github.com/ipld/js-ipld-git/issues/6)) ([b1f8bd4](https://github.com/ipld/js-ipld-git/commit/b1f8bd4))



<a name="0.1.0"></a>
# [0.1.0](https://github.com/ipld/js-ipld-git/compare/51a9b5e...v0.1.0) (2017-09-02)


### Bug Fixes

* deps in package.json ([fece381](https://github.com/ipld/js-ipld-git/commit/fece381))


### Features

* v0.1.0 ([51a9b5e](https://github.com/ipld/js-ipld-git/commit/51a9b5e))



