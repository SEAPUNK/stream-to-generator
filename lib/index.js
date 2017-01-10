'use strict'

const stream = require('stream')

function streamToGenerator (readStream, handlerFunction) {
  return new Promise((resolve, reject) => {
    let generator
    // has generator called finish() or been stopped
    let generatorFinished = false
    // has stream emitted end()
    let streamEnded = false

    // We are relying on the fact that the handler generator function is
    // pseudo-synchronous, since the only time it yields will be when it doesn't
    // block the event loop is when it `yield`s, where we have control over the
    // generator function.

    const finish = function finish (retval) {
      generatorFinished = true
      return resolve(retval)
    }

    const read = function read () {
      if (streamEnded) {
        generatorFinished = true
        generator.return()
        return reject(
          new Error('handler called read() multiple times after stream end')
        )
      }
    }

    generator = handlerFunction(read, finish)
    generator.next()

    readStream.on('error', err => {
      if (!generatorFinished) {
        generatorFinished = true
        generator.return()
      }
      return reject(err)
    })

    readStream.on('data', data => {
      if (generatorFinished) return
      generator.next([false, data])
    })

    readStream.on('end', () => {
      if (generatorFinished) return
      streamEnded = true
      generator.next([true, undefined])
    })
  })
}

module.exports = streamToGenerator
