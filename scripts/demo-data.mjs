import { isDebugMode, encodeToBase64, encodeToHex, decodeFromBase64, decodeFromHex, safeDecodeFromBase64, safeDecodeFromHex } from '../src/main.js'
export const runDemo = async () => {
  const previous = process.env.NODE_ENV
  const modes = {}
  try {
    for (const env of ['development', 'production']) { process.env.NODE_ENV = env; modes[env] = isDebugMode() }
  } finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous }
  const values = ['Привіт', 'Node.js', '✓']
  const base64 = encodeToBase64(...values)
  const hex = encodeToHex(...values)
  const decoded = { base64: decodeFromBase64(base64), hex: decodeFromHex(hex) }
  safeDecodeFromBase64(base64); safeDecodeFromHex(hex)
  for (const decoder of [safeDecodeFromBase64, safeDecodeFromHex]) {
    try { decoder('invalid!') } catch (error) { console.log(`Ожидаемая проверка: ${error.message}`) }
  }
  console.log(`Base64: ${base64}`); console.log(`Hex: ${hex}`)
  return { modes, values, base64, hex, decoded }
}
