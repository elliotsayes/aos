import { test } from 'node:test'
import * as assert from 'node:assert'
import AoLoader from './load.cjs'
import fs from 'fs'

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

const wasm = fs.readFileSync('./process.wasm')

test('create sqlite db, run insert & select', async () => {
  const handle = await AoLoader(wasm)

  const run1 = `
local sqlite3 = require("lsqlite3")

db = sqlite3.open_memory()

db:exec[[
  CREATE TABLE test (id INTEGER PRIMARY KEY, content);
  INSERT INTO test VALUES (NULL, 'Hello Lua');
  INSERT INTO test VALUES (NULL, 'Hello Sqlite3');
  INSERT INTO test VALUES (NULL, 'Hello ao!!!');
]]
return "ok"
`
  const msg1 = msg(run1)
  const result1 = await handle(null, msg1, env)
  console.log("result1:\n" + result1.Output?.data.output)
  assert.equal(result1.Output?.data.output, "ok")

  const run2 = `
local s = ""

for row in db:nrows("SELECT * FROM test") do
  s = s .. row.id .. ": " .. row.content .. "\\n"
end

return s
`
  const msg2 = msg(run2)
  const result2 = await handle(result1.Memory, msg2, env)
  console.log("\nresult2:\n" + result2.Output?.data.output)
  assert.equal(result2.Output?.data.output, "1: Hello Lua\n2: Hello Sqlite3\n3: Hello ao!!!\n")
})