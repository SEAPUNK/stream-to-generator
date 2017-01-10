import test from 'ava'
import streamToGenerator from '../'

import fs from 'fs'
import path from 'path'

test('readme example should work', async t => {
  t.plan(3)

  const fileLoc = path.join(__dirname, 'fixtures/LARGE_FILE')
  const readStream = fs.createReadStream(fileLoc)
  const streamData = await streamToGenerator(readStream, readHandler)
  const rawData = fs.readFileSync(fileLoc)

  t.is(streamData instanceof Buffer, true)
  t.is(rawData instanceof Buffer, true)

  // For some strange reason, when the stream data is missing the first 65535 bytes,
  // this causes a HUGE memory leak!
  // TODO: Look into this.
  t.is(streamData.compare(rawData), 0)
})

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
