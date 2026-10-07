const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

// Load the actual application modules, resolving the same @ alias as Next.js.
function app() {
  const cache = new Map(), values = [], refs = [], effects = []
  const storage = new Map()
  let cursor = 0, refCursor = 0, failWrites = false, writes = 0
  const react = {
    useState(initial) {
      const index = cursor++
      if (!(index in values)) values[index] = typeof initial === 'function' ? initial() : initial
      return [values[index], value => {
        // React Strict Mode may invoke updaters twice: only the last result commits.
        if (typeof value === 'function') { value(values[index]); values[index] = value(values[index]) }
        else values[index] = value
      }]
    },
    useRef(value) { const i = refCursor++; return refs[i] ?? (refs[i] = { current: value }) },
    useCallback: callback => callback,
    useEffect: callback => effects.push(callback),
  }
  const localStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => { if (failWrites) throw new Error('QuotaExceededError'); writes++; storage.set(key, value) },
    removeItem: key => storage.delete(key),
  }
  function load(file) {
    file = path.resolve(__dirname, '..', file)
    if (!file.endsWith('.ts')) file += '.ts'
    if (cache.has(file)) return cache.get(file).exports
    const module = { exports: {} }; cache.set(file, module)
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
    const requireApp = spec => spec === 'react' ? react : load(spec.startsWith('@/') ? 'src/' + spec.slice(2) : path.resolve(path.dirname(file), spec))
    new Function('require', 'module', 'exports', 'window', 'localStorage', code)(requireApp, module, module.exports, {}, localStorage)
    return module.exports
  }
  const hook = load('src/hooks/useCalculator').useCalculator
  const render = () => {
    cursor = 0; refCursor = 0; effects.length = 0
    const result = hook(); effects.splice(0).forEach(effect => effect())
    return result
  }
  return { load, render, storage, fail: () => { failWrites = true }, writes: () => writes }
}

const base = { profileKey: 'round', params: { d: 20 }, metalGroup: 'Сталь', grade: '20', quantity: 1 }

test('valid mass and inverse length agree', () => {
  const { calcMass, calcLength } = app().load('src/lib/calculations')
  const result = calcMass({ ...base, quantity: 3, length: 6 })
  assert.ok(Math.abs(result.mass - Math.PI / 4 * 400 * .00785 * 18) < .0001)
  assert.equal(calcLength(result.mass, { ...base, quantity: 3 }), 6)
})

test('impossible sections and non-finite input are rejected in both directions', () => {
  const { calcMass, calcLength } = app().load('src/lib/calculations')
  for (const patch of [
    { profileKey: 'pipe', params: { d: 20, t: 30 } },
    { profileKey: 'pipe', params: { d: 20, t: 10 } },
    { profileKey: 'pipe_prof', params: { a: 60, b: 40, t: 21 } },
    { profileKey: 'beam', params: { h: 10, b: 20, tw: 3, tf: 6 } },
    { params: { d: NaN } }, { params: { d: Infinity } }, { quantity: 0 }, { quantity: 1.5 },
  ]) {
    assert.equal(calcMass({ ...base, ...patch, length: 1 }), null)
    assert.equal(calcLength(100, { ...base, ...patch }), null)
  }
  assert.equal(calcMass({ ...base, length: Infinity }), null)
  assert.equal(calcLength(Infinity, base), null)
})

test('sheet mass uses dimensions without an unrelated length field', () => {
  const { calcMass } = app().load('src/lib/calculations')
  assert.equal(calcMass({ ...base, profileKey: 'sheet', params: { a: 1000, b: 1000, t: 4 } }).mass, 31.4)
})

test('quick input keeps repeated grade/dimension and dimension/mass values', () => {
  const { parseQuickInput } = app().load('src/lib/quickInputParser')
  for (const input of ['Сталь 20 круг 20 масса 120 кг', 'Сталь 20 круг 20 120', 'Сталь 20 круг 120 масса 120 кг']) {
    const r = parseQuickInput(input, 'Сталь')
    assert.equal(r.ok, true, JSON.stringify({input,r}))
    assert.equal(r.params.d, input.includes('круг 120') ? 120 : 20)
    assert.equal(r.mass, 120)
  }
})

test('quick input handles stainless names and dimension separators', () => {
  const { parseQuickInput } = app().load('src/lib/quickInputParser')
  const r = parseQuickInput('Нержавеющая сталь 12Х18Н10Т круг 16 масса 120 кг', 'Сталь')
  assert.equal(r.ok, true, JSON.stringify(r)); assert.equal(r.metalGroup, 'Нержавейка')
  for (const separator of ['x', 'X', 'х', '×', '*']) {
    const r = parseQuickInput(`Сталь 20 труба 57${separator}3 120 кг`, 'Сталь')
    assert.equal(r.ok, true); assert.deepEqual(r.params, { d: 57, t: 3 }); assert.ok(r.chips.includes('57×3'))
  }
})

test('explicit grade takes priority over a numeric dimension', () => {
  const { parseQuickInput } = app().load('src/lib/quickInputParser')
  const r = parseQuickInput('Сталь 45 круг 20 масса 120 кг', 'Сталь')
  assert.equal(r.ok, true); assert.equal(r.grade, '45'); assert.equal(r.params.d, 20)
})

test('switching directions preserves new input and computes the selected target', () => {
  const a = app(); let c = a.render()
  c.setLength(1); c.calculate('mass'); c = a.render()
  assert.equal(c.state.result.target, 'mass'); assert.equal(c.state.mass, null)
  c.setLength(null); c.setMass(120); c.calculate('length'); c = a.render()
  assert.equal(c.state.result.target, 'length'); assert.equal(c.state.mass, 120)
  c.setMass(null); c.setLength(2); c.calculate('mass'); c = a.render()
  assert.equal(c.state.result.target, 'mass'); assert.equal(c.state.error, null)
})

test('repeated calculations do not duplicate history, different inputs still save', () => {
  const a = app(); let c = a.render()
  c.setLength(1); c.calculate('mass'); c = a.render()
  assert.equal(c.state.history.length, 1)
  c.calculate('mass'); c = a.render()
  assert.equal(c.state.unchanged, true); assert.equal(c.state.history.length, 1)
  c.setParam('d', 10); c.setLength(4); c.calculate('mass'); c = a.render()
  assert.equal(c.state.history.length, 2) // Same mass, different geometry.
  assert.equal(a.load('src/lib/history').loadHistory().length, 2)
})

test('corrupt history and denied writes cannot break calculations', () => {
  const a = app(); const history = a.load('src/lib/history')
  for (const bad of ['{}', 'null', '[null,{}]', '{']) {
    a.storage.set('metal_calc_history', bad); assert.deepEqual(history.loadHistory(), [])
  }
  let c = a.render(); a.fail()
  c.setLength(1); c.calculate('mass'); c = a.render()
  assert.ok(c.state.result.value > 0); assert.equal(c.state.error, null)
  assert.equal(a.writes(), 0)
})

test('volume profiles return mass even if length was previously selected', () => {
  const a = app(); let c = a.render()
  c.selectProfile('sheet'); c.calculate('length'); c = a.render()
  assert.equal(c.state.result.target, 'mass'); assert.equal(c.state.result.massOne, 31.4)
})
