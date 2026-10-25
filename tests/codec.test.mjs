import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { isDebugMode, encodeToBase64, encodeToHex, decodeFromBase64, decodeFromHex, safeDecodeFromBase64, safeDecodeFromHex } from '../src/main.js'
let env
beforeEach(context => { env = process.env.NODE_ENV; context.mock.method(console, 'log', () => {}); context.mock.method(console, 'error', () => {}) })
afterEach(() => { if (env === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = env })
for (const value of ['development', 'production', 'test', 'Development', '']) test(`NODE_ENV=${JSON.stringify(value)}`, () => { process.env.NODE_ENV = value; assert.equal(isDebugMode(), value === 'development'); assert.deepEqual(console.log.mock.calls.map(call => call.arguments), [[value], [value === 'development']]) })
test('unset environment is not debug mode', () => { delete process.env.NODE_ENV; assert.equal(isDebugMode(), false) })
for (const [name, encode, decode, safe] of [['base64', encodeToBase64, decodeFromBase64, safeDecodeFromBase64], ['hex', encodeToHex, decodeFromHex, safeDecodeFromHex]]) {
  test(`${name}: multiple arguments are colon-delimited and logged`, () => { const result = encode('hello', 'world'); assert.equal(result, Buffer.from('hello:world').toString(name)); assert.deepEqual(console.log.mock.calls[0].arguments, [['hello', 'world']]) })
  test(`${name}: Unicode round trip`, () => { const result = encode('Привіт', '🌍', '✓'); assert.equal(decode(result), 'Привіт:🌍:✓'); assert.equal(safe(result), 'Привіт:🌍:✓') })
  test(`${name}: empty input round trip`, () => { assert.equal(encode(), ''); assert.equal(decode(''), ''); assert.equal(safe(''), '') })
  test(`${name}: delimiters are not incorrectly unescaped`, () => assert.equal(decode(encode('a:b', 'c')), 'a:b:c'))
  test(`${name}: safe decoder rejects non-string data`, () => { for (const value of [null, undefined, 42, [], {}]) assert.throws(() => safe(value), new RegExp(`Invalid ${name} string`)) })
  test(`${name}: invalid characters are logged and rejected`, () => { assert.throws(() => safe('invalid!'), new RegExp(`Invalid ${name} string`)); assert.deepEqual(console.error.mock.calls.at(-1).arguments, [`Invalid ${name} string`]) })
}
test('base64: padding, unused bits, whitespace and truncation are validated', () => { for (const value of ['a', 'YQ', 'YQ=', 'Y===', 'YQ===', 'YQ==\n', 'YR==', 'YWJ=']) assert.throws(() => safeDecodeFromBase64(value), /Invalid base64/) })
test('base64: each legal padding length is accepted', () => { for (const value of ['a', 'ab', 'abc', 'abcd']) assert.equal(safeDecodeFromBase64(Buffer.from(value).toString('base64')), value) })
test('hex: uppercase is accepted', () => assert.equal(safeDecodeFromHex('D09FD180D0B8D0B2D196D182'), 'Привіт'))
test('hex: odd digits, prefix and whitespace are rejected', () => { for (const value of ['a', 'abc', '0xff', '61 62', 'gg']) assert.throws(() => safeDecodeFromHex(value), /Invalid hex/) })
test('ordinary decoder logs unexpected type errors and rethrows', () => { assert.throws(() => decodeFromBase64({}), TypeError); assert.equal(console.error.mock.callCount(), 1) })
