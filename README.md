stream-to-generator
===

[![Greenkeeper badge](https://badges.greenkeeper.io/SEAPUNK/stream-to-generator.svg)](https://greenkeeper.io/)

[![npm version](https://img.shields.io/npm/v/stream-to-generator.svg?style=flat-square)](https://npmjs.com/package/stream-to-generator)
[![javascript standard style](https://img.shields.io/badge/code%20style-standard-blue.svg?style=flat-square)](http://standardjs.com/)
[![travis build](https://img.shields.io/travis/SEAPUNK/stream-to-generator/master.svg?style=flat-square)](https://travis-ci.org/SEAPUNK/stream-to-generator)
[![coveralls coverage](https://img.shields.io/coveralls/SEAPUNK/stream-to-generator.svg?style=flat-square)](https://coveralls.io/github/SEAPUNK/stream-to-generator)
[![david dependencies](https://david-dm.org/SEAPUNK/stream-to-generator.svg?style=flat-square)](https://david-dm.org/SEAPUNK/stream-to-generator)
[![david dev dependencies](https://david-dm.org/SEAPUNK/stream-to-generator/dev-status.svg?style=flat-square)](https://david-dm.org/SEAPUNK/stream-to-generator)

Convert Node.js readable streams to generator functions

`npm install stream-to-generator`

- [usage](#usage)
- [api](#api)

---

usage
---

```js
import streamToGenerator from 'stream-to-generator'
import fs from 'fs'

async function main () {
  const fileLoc = path.join(__dirname, 'fixtures/LARGE_FILE')
  const readStream = fs.createReadStream(fileLoc)
  const data = await streamToGenerator(readStream, readHandler)
}

function * readHandler (read, finish) {
  let chunks = []

  let done, chunk
  while (true) {
    ;[done, chunk] = yield read()
    if (done) break
    chunks.push(chunk)
  }

  return yield finish(Buffer.concat(chunks))
}

```

api
---

`streamToGenerator(readStream, handlerFunction)`

Converts a readable stream to a generator function.

`readStream` is a readable stream.

`handlerFunction` is a generator function that takes two arguments:

- `read()` Creates a request for more data in the stream. This must be done with `yield`. If data could not be read, then the handler function is cancelled. This returns an array: `[end, data]`:
  - `end` is a Boolean, which indicates whether there will be more data or not. Yielding a `read()` after `end == true` will throw an error.
  - `data` is the next chunk of data gathered from the stream. If `end == true`, data will be undefined.
- `finish(retval)` Creates a request to end the handler. This resolves the created promise from calling `streamToGenerator()` with `retval`. This should be done with `yield` (the wrapper will be able to cancel the generator), but not required to.

Returns a `Promise`, which is resolved with `retval` when the readHandler calls `finish(retval)`. Otherwise, the `Promise` is rejected with an error if the stream or handler function encounters an error.
