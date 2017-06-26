/* global describe, it */
/* eslint no-multi-spaces:0 */

const assert = require('assert')
const signedToken = require('..')

describe('#signedToken', function () {
  const secret = 'curiosity killed the cat'

  const tests = [
    {
      name: 'default',
      opts: undefined,
      length: 64,
      token: 'zNVuk8jR2aBHvpmr75jnUqOiqjsYUqt_QoqXljhXkeS7ItDEDHufBEaMra8GGjSw'
    }, {
      name: 'tokenlen=0',
      opts: {tokenlen: 0},
      length: 67,
      token: 'zNVuk8jR2aBHvpmr75jnUqOiqjsYUqt_QoqXljhXkeS7ItDEDHufBEaMra8GGjSw7VI'
    }, {
      name: 'commonlen=10',
      opts: {commonlen: 10},
      length: 53,
      token: '-FxdR3YcKnaNfrYrjJVIrUAn8VpAXTa2Nq76ANAx5i-QYw7aEzNqo'
    }, {
      name: 'commonlen=8, tokenlen=16',
      opts: {commonlen: 8, tokenlen: 16},
      length: 16,
      token: 'zNVuk8jR5pWwHgVi'
    }, {
      name: 'digest=sha1',
      opts: {digest: 'sha1'},
      length: 51,
      token: '2WmSUH8SWAtrPEQnXOgLrAMZdUaYe0e8gVloEYifL8oGwQb4NWE'
    }
  ]

  describe('should throw on missing secret', function () {
    assert.throws(() => {
      signedToken()
    }, /signed token needs secret/)
  })

  describe('should throw on bad tokenlen', function () {
    assert.throws(() => {
      signedToken('secret', {commonlen: 12, tokenlen: 14})
    }, /signed token needs a greater tokenlen/)
  })

  describe('should create a token', function () {
    tests.forEach((test) => {
      it(test.name, function () {
        return signedToken(secret, test.opts)
          .create()
          .then((tokenVal) => {
            // console.log(tokenVal)
            assert.equal(typeof tokenVal, 'string')
            assert.equal(tokenVal.length, test.length)
          })
      })

      it(test.name + ' - sync', function () {
        const tokenVal = signedToken(secret, test.opts).createSync()
        // console.log(tokenVal)
        assert.equal(typeof tokenVal, 'string')
        assert.equal(tokenVal.length, test.length)
      })
    })
  })

  describe('should verify token', function () {
    tests.forEach((test) => {
      it(test.name, function () {
        return signedToken(secret, test.opts)
          .verify(test.token)
          .then((tokenVal) => {
            assert.equal(typeof tokenVal, 'string')
            assert.equal(tokenVal.length, test.length)
          })
      })

      it(test.name + ' - sync', function () {
        const tokenVal = signedToken(secret, test.opts).verifySync(test.token)
        assert.equal(typeof tokenVal, 'string')
        assert.equal(tokenVal.length, test.length)
      })

      it(test.name + ' - bad case', function () {
        return signedToken(secret, test.opts)
          .verify(test.token + '7')
          .then((tokenVal) => {
            assert.equal(typeof tokenVal, 'undefined')
          })
      })

      it(test.name + ' - sync bad case', function () {
        const tokenVal = signedToken(secret, test.opts).verifySync(test.token + '7')
        assert.equal(typeof tokenVal, 'undefined')
      })
    })
  })

  describe('hmac', function () {
    it('should rehash a token', function () {
      const token = 'F2RvUN1nKZyYC_PZVUOoJSucpoddSGc8qIX3725qQt-PgLKeOo55Fi04Dpz4HFHE'
      const rehashed = signedToken(secret).hmac(token)
      assert.ok(token !== rehashed)
      assert.equal(rehashed, 'AvsROvXq1Tonv8SdQeBOKePu3JhlTLu7yd953myuEZA')
    })
  })
})
