'use strict';

var crypto = require('crypto');
var util = require('util');
var timingSafeEqual = require('compare-timing-safe');
var urlSafeBase64 = require('url-safe-base64');

/** @typedef {import('./types').SignedTokenReturn} SignedTokenReturn */

const randomBytes = util.promisify(crypto.randomBytes);

/**
* creates a signedToken instance wrapping `secret`
* @param {string} secret common secret
* @param {object} [opts]
* @param {string} [opts.digest=sha265] hmac digest
* @param {number} [opts.commonlen=24] length of random bytes for common length
* @param {number} [opts.tokenlen=64] length of token
* @returns {SignedTokenReturn} `{create, verify, hmac}`
* @example - asynchronous
* const signedToken = require('signed-token')
* const stfn = signedToken('my secret')
* stfn.create()
* .then((token) => stfn.verify(token))
* .then((res) => console.log(res)) // equals `token`
*
* @example - synchronous
* const signedToken = require('signed-token')
* const stfn = signedToken('my secret')
* const token = stfn.createSync()
* const res = stfn.verifySync(token)
* res === token
* //> true
*/
const signedToken = (secret, opts) => {
  const _opts = Object.assign({
    digest: 'sha256',
    commonlen: 24,
    tokenlen: 64
  }, opts);

  if (!secret) {
    throw new TypeError('signed token needs secret')
  }
  if (_opts.tokenlen !== 0 && _opts.tokenlen < _opts.commonlen * 2) {
    throw new TypeError('signed token needs a greater tokenlen')
  }

  /**
   * @param {string} token
   * @returns {string}
   */
  const hmac = (token) => urlSafeBase64.trim(crypto
    .createHmac(_opts.digest, secret)
    .update(token)
    .digest('base64'));

  const _create = (common) => {
    const hash = hmac(common);
    let enc = urlSafeBase64.encode(`${common}${hash}`);
    if (_opts.tokenlen) enc = enc.substr(0, _opts.tokenlen);
    return enc
  };

  const _common = (token) => {
    let promise;
    if (!token) {
      promise = randomBytes(_opts.commonlen * 2);
    } else {
      promise = new Promise((resolve) => resolve(undefined));
    }
    return promise
      .then((buffer) => {
        const common = (token || buffer.toString('base64')).substr(0, _opts.commonlen);
        return _create(common)
      })
  };

  /**
   * @private
   */
  const _commonSync = (token) => {
    const common = (token || crypto.randomBytes(_opts.commonlen * 2).toString('base64')).substr(0, _opts.commonlen);
    return _create(common)
  };

  /**
  * creates a signed token
  * @return {Promise<string>} signed token url safe base64 encoded
  */
  const create = () => _common();

  /**
  * sync generation of a signed token
  * @return {string} signed token url safe base64 encoded
  */
  const createSync = () => _commonSync();

  /**
  * verify a signed token using `secret`
  * @return {Promise<string|undefined>} token if it was correctly signed
  */
  const verify = (token) => (
    _common(urlSafeBase64.decode(token || ''))
      .then((freshToken) => (timingSafeEqual(token, freshToken) ? token : undefined))
  );

  /**
  * sync validation of signed token
  * @return {string|undefined} token if it was correctly signed
  */
  const verifySync = (token) => {
    const freshToken = _commonSync(urlSafeBase64.decode(token || ''));
    return (timingSafeEqual(token, freshToken) ? token : undefined)
  };

  return { create, createSync, verify, verifySync, hmac }
};

module.exports = signedToken;
