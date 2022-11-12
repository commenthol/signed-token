# signed-token

> signed HMAC crypto token

[![NPM version](https://badge.fury.io/js/signed-token.svg)](https://www.npmjs.com/package/signed-token/)
[![Build Status](https://github.com/commenthol/signed-token/workflows/CI/badge.svg?branch=master&event=push)](https://github.com/commenthol/signed-token/actions/workflows/ci.yml?query=branch%3Amaster)

Generation and validation of signed HMAC token with variable lengths. 
The token is [url-safe Base64](https://www.npmjs.com/package/url-safe-base64) encoded and can be used in urls as well as forms.

## TOC

* [Example](#example)
* [API](#api)
  * [`signedToken(secret, [opts])`](#signedtokensecret-opts)
  * [`create`](#create)
  * [`createSync`](#createsync)
  * [`verify`](#verify)
  * [`verifySync`](#verifysync)
* [Installation](#installation)
* [Tests](#tests)
* [LICENSE](#license)

## Example

Asynchronous using Promises

```js
const signedToken = require('signed-token')

const stfn = signedToken('my secret')
stfn.create()
.then((token) => stfn.verify(token))
.then((res) => console.log(res)) // res === token
```

Synchronous

```js
const signedToken = require('signed-token')

const stfn = signedToken('my secret')
const token = stfn.createSync()
const res = stfn.verifySync(token)
res === token
//> true
```

## API

### `signedToken(secret, [opts])`

creates a signedToken instance, wrapping `secret`

**Parameters**

| parameter              | type   | description                                          |
| ---------------------- | ------ | ---------------------------------------------------- |
| `secret`               | string | common secret                                        |
| `[opts]`               | object | _optional:_                                          |
| `[opts.digest=sha265]` | string | _optional:_ hmac digest                              |
| `[opts.commonlen=24]`  | number | _optional:_ length of random bytes for common length |
| `[opts.tokenlen=64]`   | number | _optional:_ length of token                          |

**Returns** `object`, `{create, verify, createSync, verifySync, hmac}`

### `create`

creates a signed token

**Returns** `Promise`, `{string}` signed token url safe base64 encoded

### `createSync`

sync generation of a signed token

**Returns** `string` signed token url safe base64 encoded

### `verify`

verify a signed token using secret

**Returns** `Promise`, `{string|undefined}` - token if it was correctly signed

### `verifySync`

sync validation of signed token

**Returns** `string,undefined`,
token if it was correctly signed

## Installation

Requires [nodejs](http://nodejs.org/) >= v12.0.0

```sh
$ npm install --save signed-token
```

## Tests

```sh
$ npm test
```

## LICENSE

UNLICENSE <https://unlicense.org>
