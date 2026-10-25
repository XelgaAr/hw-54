import { isDebugMode, encodeToBase64, encodeToHex, decodeFromBase64, decodeFromHex, safeDecodeFromBase64, safeDecodeFromHex } from '../src/main.js'
const args = process.argv.slice(2)
const values = args.length ? args : ['Привет, Node.js', '✓', 'UTF-8']
console.log('NODE_ENV:', process.env.NODE_ENV ?? '(не задано)')
isDebugMode()
const base64 = encodeToBase64(...values)
const hex = encodeToHex(...values)
console.log('Base64:', base64)
console.log('Hex:', hex)
console.log('Decoded Base64:', decodeFromBase64(base64))
console.log('Decoded Hex:', decodeFromHex(hex))
safeDecodeFromBase64(base64)
safeDecodeFromHex(hex)
for (const decode of [safeDecodeFromBase64, safeDecodeFromHex]) {
  try { decode('invalid!') }
  catch (error) { console.log('Ожидаемая ошибка:', error.message) }
}
