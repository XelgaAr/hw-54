const status = (message, error = false) => {
  const output = document.getElementById('message')
  output.textContent = message
  output.dataset.error = String(error)
}
const loadDemo = async () => {
  const response = await fetch('./demo.json')
  if (!response.ok) throw new Error(`Не удалось загрузить запись: HTTP ${response.status}`)
  const data = await response.json()
  document.getElementById('runtime').textContent = `Node.js ${data.node}`
  document.getElementById('stamp').textContent = `Сборка: ${data.generatedAt} · Среда: ${data.node}`
  document.getElementById('trace').textContent = data.logs.map(entry => `${entry.level === 'error' ? '[error] ' : ''}${entry.text}`).join('\n')
  return data
}
const showLoadError = error => {
  const output = document.getElementById('trace-error')
  output.hidden = false; output.textContent = error.message
  document.getElementById('trace').textContent = 'Запись недоступна. Пересоберите проект и обновите страницу.'
  document.getElementById('stamp').textContent = 'Нет данных о сборке'
}
const value = document.getElementById('value')
const result = document.getElementById('result')
for (const button of document.querySelectorAll('[data-op]')) button.addEventListener('click', () => {
  try {
    const input = value.value
    const operation = button.dataset.op
    if (operation.startsWith('decode')) {
      const hex = operation === 'decode-hex'
      const pattern = hex ? /^(?:[a-fA-F0-9]{2})*$/ : /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/
      if (!pattern.test(input)) throw new Error(hex ? 'Invalid hex string' : 'Invalid base64 string')
      const binary = hex ? null : atob(input)
      if (!hex && btoa(binary) !== input) throw new Error('Invalid base64 string')
      const bytes = hex ? Uint8Array.from(input.match(/../g) ?? [], pair => parseInt(pair, 16)) : Uint8Array.from(binary, char => char.charCodeAt(0))
      result.value = new TextDecoder().decode(bytes)
    } else {
      const bytes = new TextEncoder().encode(input)
      result.value = operation === 'hex' ? Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('') : btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''))
    }
    status('Готово. Результат можно использовать для обратного преобразования.')
  } catch (error) { result.value = ''; status(error.message, true) }
})
document.getElementById('copy-input').addEventListener('click', () => { value.value = result.value; value.focus(); status('Результат перенесён в поле ввода.') })
document.getElementById('clear').addEventListener('click', () => { value.value = ''; result.value = ''; status('Поля очищены.'); value.focus() })
loadDemo().catch(showLoadError)
