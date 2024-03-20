import { test } from 'node:test'
import * as assert from 'node:assert'
import AoLoader from './load.cjs'
import fs from 'fs'

const wasm = fs.readFileSync('./process.wasm')

// test('run evaluate action successfully', async () => {
//   const handle = await AoLoader(wasm)
//   const env = {
//     Process: {
//       Id: 'AOS',
//       Owner: 'FOOBAR',
//       Tags: [
//         { name: 'Name', value: 'Thomas' }
//       ]
//     }
//   }
//   const msg = {
//     Target: 'AOS',
//     Owner: 'FOOBAR',
//     ['Block-Height']: "1000",
//     Id: "1234xyxfoo",
//     Module: "WOOPAWOOPA",
//     Tags: [
//       { name: 'Action', value: 'Eval' }
//     ],
//     Data: '1 + 1'
//   }
//   const result = await handle(null, msg, env)
//   console.log(result)
//   assert.equal(result.Output?.data.output, 2)
//   assert.ok(true)
// })

test('print hello world', async () => {
  const handle = await AoLoader(wasm)
  const env = {
    Process: {
      Id: 'AOS',
      Owner: 'FOOBAR',
      Tags: [
        { name: 'Name', value: 'Thomas' }
      ]
    }
  }
  const msg = {
    Target: 'AOS',
    Owner: 'FOOBAR',
    ['Block-Height']: "1000",
    Id: "1234xyxfoo",
    Module: "WOOPAWOOPA",
    Tags: [
      { name: 'Action', value: 'Eval' }
    ],
    Data: 'print("Hello World")'
  }
  const result = await handle(null, msg, env)
  console.log(result)
  assert.equal(result.Output?.data.output, "Hello World")
  assert.ok(true)
})