import { test } from 'node:test'
import * as assert from 'node:assert'
import AoLoader from './load.cjs'
import fs from 'fs'

const wasm = fs.readFileSync('./process.wasm')

test('create sqlite db, run insert & select', async () => {
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
  const msg = (cmd) => ({
    Target: 'AOS',
    Owner: 'FOOBAR',
    ['Block-Height']: "1000",
    Id: "1234xyxfoo",
    Module: "WOOPAWOOPA",
    Tags: [
      { name: 'Action', value: 'Run' }
    ],
    Data: cmd
  })
  const run1 = `
sqlite3 = require("lsqlite3")

db = sqlite3.open_memory()

db:exec "CREATE TABLE test (col1, col2)"
db:exec "INSERT INTO test VALUES (1, 2)"
db:exec "INSERT INTO test VALUES (2, 4)"
db:exec "INSERT INTO test VALUES (3, 6)"
db:exec "INSERT INTO test VALUES (4, 8)"
db:exec "INSERT INTO test VALUES (5, 10)"

return "ok"
`
  const run2 = `
db:create_function("my_sum", 2, function(ctx, a, b)
  ctx:result_number( a + b )
end)

local s = ""

for col1, col2, sum in db:urows("SELECT *, my_sum(col1, col2) FROM test") do
  s = s .. col1 .. " + " .. col2 .. " = " .. sum .. "\\n"
end

return s
`

  const result1 = await handle(null, msg(run1), env)
  console.log(result1.Output?.data.output)
  assert.equal(result1.Output?.data.output, "ok")

  const result2 = await handle(result1.Memory, msg(run2), env)
  console.log(result2.Output?.data.output)
  assert.equal(result2.Output?.data.output, "1 + 2 = 3.0\n2 + 4 = 6.0\n3 + 6 = 9.0\n4 + 8 = 12.0\n5 + 10 = 15.0\n")
  assert.ok(true)
})