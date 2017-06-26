const crypto = require('crypto')
const promisify = require('./promisify')
const {encode, decode, trim} = require('url-safe-base64')

const randomBytes = promisify(crypto.randomBytes)

/**
* creates a signedToken instance wrapping `secret`
* @param {string} secret - common secret
* @param {object} [opts]
* @param {string} [opts.digest=sha265] - hmac digest
* @param {number} [opts.commonlen=24] - length of random bytes for common length
* @param {number} [opts.tokenlen=64] - length of token
* @returns {object} - `{generate, validate, hmac}`
* @example - asynchronous
* const signedToken = require('signed-token')
* const stfn = signedToken('my secret')
* stfn.generate()
* .then((token) => stfn.validate(token))
* .then((res) => console.log(res)) // equals `token`
*
* @example - synchronous
* const signedToken = require('signed-token')
* const stfn = signedToken('my secret')
* const token = stfn.generateSync()
* const res = stfn.validateSync(token)
* res === token
* //> true
*/
const signedToken = (secret, opts) => {
  const _opts = Object.assign({
    digest: 'sha256',
    commonlen: 24,
    tokenlen: 64
  }, opts)

  if (!secret) {
    throw new TypeError('signed token needs secret')
  }
  if (_opts.tokenlen !== 0 && _opts.tokenlen < _opts.commonlen * 2) {
    throw new TypeError('signed token needs a greater tokenlen')
  }

  const hmac = (token) => trim(crypto
    .createHmac(_opts.digest, secret)
    .update(token)
    .digest('base64'))

  const _generate = (common) => {
    const hash = hmac(common)
    let enc = encode(`${common}${hash}`)
    if (_opts.tokenlen) enc = enc.substr(0, _opts.tokenlen)
    return enc
  }

  const _common = (token) => {
    let promise
    if (!token) {
      promise = randomBytes(_opts.commonlen * 2)
    } else {
      promise = new Promise((resolve) => resolve())
    }
    return promise
    .then((buffer) => {
      const common = (token || buffer.toString('base64')).substr(0, _opts.commonlen)
      return _generate(common)
    })
  }

  const _commonSync = (token) => {
    const common = (token || crypto.randomBytes(_opts.commonlen * 2).toString('base64')).substr(0, _opts.commonlen)
    return _generate(common)
  }

  /**
  * generates a signed token
  * @return {Promise} - {string} signed token url safe base64 encoded
  */
  const generate = () => _common()

  /**
  * sync generation of a signed token
  * @return {string} signed token url safe base64 encoded
  */
  const generateSync = () => _commonSync()

  /**
  * validate a signed token using `secret`
  * @return {Promise} - {string|null} - token if it was correctly signed
  */
  const validate = (token) => (
    _common(decode(token || ''))
    .then((freshToken) => (constTimeCompare(token, freshToken) ? token : undefined))
  )

  /**
  * sync validation of signed token
  * @return {String|Null} - token if it was correctly signed
  */
  const validateSync = (token) => {
    const freshToken = _commonSync(decode(token || ''))
    return (constTimeCompare(token, freshToken) ? token : undefined)
  }

  return {generate, generateSync, validate, validateSync, hmac}
}

module.exports = signedToken

/**
* string comparison in length-constant time
*/
function constTimeCompare (a = '', b = '') {
  let diff = (a.length !== b.length)
  const len = Math.min(a.length, b.length)
  for (let i = 0; i < len; i++) {
    diff |= (a[i] !== b[i])
  }
  return (!!diff === false)
}
