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



