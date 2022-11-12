export default signedToken;
export type SignedTokenReturn = import('./types').SignedTokenReturn;
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
declare function signedToken(secret: string, opts?: {
    digest?: string | undefined;
    commonlen?: number | undefined;
    tokenlen?: number | undefined;
} | undefined): SignedTokenReturn;
