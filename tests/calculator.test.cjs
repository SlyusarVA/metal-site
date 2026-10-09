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

test('sheet supports inverse length in the common flat-product form', () => {
  const a = app(); let c = a.render()
  c.selectProfile('sheet'); c.setMass(62.8); c.calculate('length'); c = a.render()
  assert.equal(c.state.result.target, 'length'); assert.equal(c.state.result.value, 2)
})

test('rectangular navigation groups once and keeps material restrictions', () => {
  const a = app()
  const { profiles } = a.load('src/data/profiles')
  const { groupProfiles, profileGroupKey, rectangularProfiles } = a.load('src/data/profileNavigation')
  const grouped = groupProfiles(profiles)
  assert.equal(grouped.length, profiles.length - 3)
  assert.equal(grouped.filter(p => profileGroupKey(p.key) === 'sheet').length, 1)
  assert.ok(grouped.some(p => p.key === 'square'))
  assert.ok(!grouped.some(p => p.key === 'strip'))
  assert.deepEqual(groupProfiles(profiles, ['plate', 'square']).map(p => p.key), ['plate', 'square'])
  assert.deepEqual(rectangularProfiles(['sheet', 'plate']).map(p => p.key), ['sheet', 'plate'])
  assert.deepEqual(groupProfiles(profiles, ['wire']).map(p => p.key), ['wire'])
})

test('custom order keeps the first rectangular position and all calculation IDs', () => {
  const { groupedProfileOrder, expandProfileOrder } = app().load('src/data/profileNavigation')
  assert.deepEqual(groupedProfileOrder(['round', 'flat', 'square', 'plate', 'sheet']), ['round', 'sheet', 'square'])
  assert.deepEqual(expandProfileOrder(['round', 'sheet', 'square']), ['round', 'sheet', 'plate', 'flat', 'strip', 'square'])
})

test('grouped products keep equivalent mass, individual standards and legacy history', () => {
  const a = app()
  const { calcMass } = a.load('src/lib/calculations')
  const { profileMap } = a.load('src/data/profiles')
  const { loadHistory } = a.load('src/lib/history')
  const records = ['sheet', 'plate', 'flat'].map(profileKey => {
    const params = profileKey === 'flat' ? { b: 1000, t: 4 } : { a: 2000, b: 1000, t: 4 }
    const result = calcMass({ ...base, profileKey, params, length: 2 })
    assert.equal(result.mass, 62.8)
    return { id: profileKey, timestamp: 1, profileKey, profileName: profileMap.get(profileKey).name,
      metalGroup: 'Сталь', grade: '20', params, quantity: 1, length: 2, mass: 62.8, massOne: 62.8, linearDensity: 31.4 }
  })
  assert.equal(new Set(records.map(r => profileMap.get(r.profileKey).gost)).size, 3)
  a.storage.set('metal_calc_history', JSON.stringify(records))
  assert.deepEqual(loadHistory(), records)
})

test('all flat products support the same mass and inverse length with quantity', () => {
  const { calcMass, calcLength } = app().load('src/lib/calculations')
  for (const profileKey of ['sheet', 'plate', 'flat', 'strip']) {
    const input = { ...base, profileKey, params: { b: 1000, t: 4 }, quantity: 3 }
    assert.equal(calcMass({ ...input, length: 2 }).mass, 188.4)
    assert.equal(calcLength(188.4, input), 2)
  }
})

test('legacy sheet dimension and saved history restore length in metres', () => {
  const a = app(); let c = a.render()
  c.selectProfile('sheet'); c.setParam('a', 2000); c.calculate('mass'); c = a.render()
  assert.equal(c.state.length, 2); assert.equal(c.state.result.value, 62.8)
  c.restoreFromHistory({ profileKey: 'sheet', metalGroup: 'Сталь', grade: '20', params: { a: 3000, b: 1000, t: 4 }, length: 0, quantity: 1 })
  c.calculate('mass'); c = a.render()
  assert.equal(c.state.length, 3); assert.equal(c.state.result.value, 94.2)
})

test('changing a legacy flat-product alias keeps user dimensions and quantity', () => {
  const a = app(); let c = a.render()
  c.selectProfile('sheet'); c.setParam('b', 500); c.setParam('t', 2); c.setLength(3); c.setQuantity(2)
  c.selectProfile('strip'); c.calculate('mass'); c = a.render()
  assert.equal(c.state.params.b, 500); assert.equal(c.state.params.t, 2)
  assert.equal(c.state.quantity, 2); assert.equal(c.state.result.value, 47.1)
})

test('standard and tolerance depend on material as well as product shape', () => {
  const a = app()
  const { getProfileGostCodes } = a.load('src/data/profileStandards')
  const { getWeightTolerance } = a.load('src/data/gost')
  for (const metal of ['Алюминий', 'Медь', 'Бронза']) {
    assert.ok(!getProfileGostCodes('rod', metal).includes('ГОСТ 2060-2006'))
    assert.equal(getWeightTolerance('rod', { d: 25 }, metal), null)
  }
  assert.deepEqual(getProfileGostCodes('rod', 'Латунь'), ['ГОСТ 2060-2006'])
  assert.equal(getWeightTolerance('rod', { d: 25 }, 'Латунь'), null)
  assert.deepEqual(getProfileGostCodes('plate', 'Сталь'), ['ГОСТ 19903-2015'])
  assert.deepEqual(getProfileGostCodes('plate', 'Алюминий'), ['ГОСТ 17232-2023'])
  assert.equal(getWeightTolerance('strip', { b: 20, t: 1 }, 'Алюминий'), null)
})

test('GOST 21631 uses limit means and appendix B density without double correction', () => {
  const a = app(); const { sheetBasis, defaultSheetOptions: o, sheetDensity } = a.load('src/data/aluminumSheet')
  const basis = sheetBasis('Д16', 4, 1000, o)
  assert.equal(basis.thicknessMin, 3.7); assert.equal(basis.thicknessMax, 4)
  assert.equal(basis.meanWidth, 1004); assert.equal(basis.density, 2770)
  assert.ok(Math.abs(basis.linearMass - 10.707158) < 1e-9)
  assert.equal(sheetDensity('АМг2'), 2690); assert.equal(sheetDensity('АМг6'), 2650)
  assert.equal(sheetDensity('7075 (В95)'), null); assert.equal(sheetDensity('6061'), null)
  const { calcMass, calcLength } = a.load('src/lib/calculations')
  const input = { profileKey: 'sheet', metalGroup: 'Алюминий', grade: 'Д16', params: { b: 1000, t: 4 }, quantity: 3, sheetOptions: o }
  assert.equal(calcMass({ ...input, length: 2 }).mass, 64.2429)
  assert.equal(calcLength(64.242948, input), 2)
})

test('GOST sheet boundary rules, accuracy and special symmetric alloy tolerances', () => {
  const { sheetBasis: b, defaultSheetOptions: o } = app().load('src/data/aluminumSheet')
  assert.equal(b('Д16', 4.2, 1000, o).referenceThickness, 4)
  assert.ok(Math.abs(b('Д16', 4.2, 1000, o).thicknessMin - 3.9) < 1e-9)
  assert.equal(b('Д16', 4, 1000, {...o, thicknessAccuracy:'high'}).thicknessMin, 3.76)
  assert.equal(b('Д16', 4, 1000, {...o, widthAccuracy:'high'}).widthMax, 1006)
  assert.equal(b('АМг6', 5, 1000, o).meanThickness, 5)
  assert.equal(b('АМг6', 5, 1000, o).thicknessMin, 4.75)
  assert.equal(b('АМг6', 5, 1000, {...o,condition:'other'}).meanThickness, 4.825)
  assert.equal(b('Д16', 4, 1000, {...o,symmetric:true}).meanThickness, 4)
  assert.equal(b('Д16', 5, 1000, o).widthMax, 1008)
  assert.equal(b('Д16', 5.01, 1000, o).widthMax, 1012)
  assert.equal(b('Д16', 10.5, 2800, o).thicknessMin, 9.55)
  for (const [t,w,opt] of [[.29,600,o],[10.6,1000,o],[1,599,o],[5,2801,o],[.3,1200,o],[4,2600,o],[5,2200,{...o,thicknessAccuracy:'high'}],[5,1200,{...o,widthAccuracy:'high'}],[1,1000,{...o,symmetric:true}]]) assert.equal(typeof b('Д16',t,w,opt), 'string')
})

test('GOST sheet hook saves calculation basis and rejects unsupported grades explicitly', () => {
  const a = app(); let c = a.render()
  c.selectProfile('sheet'); c.selectMetal('Алюминий','Д16'); c.setLength(2)
  c.setSheetOptions({thicknessAccuracy:'high'}); c.calculate('mass'); c = a.render()
  assert.ok(c.state.result.sheetBasis); assert.equal(c.state.history[0].sheetOptions.thicknessAccuracy,'high')
  c.selectMetal('Алюминий','6061'); c.calculate('mass'); c = a.render()
  assert.equal(c.state.result,null); assert.match(c.state.error.message,/Б.1/)
})

test('brass mass interval is derived from the squared dimensional ratio', () => {
  const a=app(); const {brassMassRange,brassDimensionTolerance,defaultBrassOptions:o}=a.load('src/data/brassTolerance')
  const r=brassMassRange('rod',20,o)
  assert.ok(Math.abs(r.minus-.029775)<1e-12); assert.ok(Math.abs(r.plus-.030225)<1e-12)
  assert.equal(brassDimensionTolerance('rod',3,o),.10)
  assert.equal(brassDimensionTolerance('rod',3.001,o),.15)
  assert.equal(brassDimensionTolerance('rod',30,o),.30)
  assert.equal(brassDimensionTolerance('rod',30.001,o),.60)
  assert.equal(brassDimensionTolerance('rod',50,o),.60)
  assert.equal(brassDimensionTolerance('rod',50.01,o),null)
  assert.equal(brassDimensionTolerance('rod',20,{...o,manufacturing:'pressed'}),.42)
  assert.equal(brassDimensionTolerance('square',4,{...o,accuracy:'increased'}),null)
  assert.equal(brassDimensionTolerance('hexagon',5,{...o,accuracy:'increased'}),.08)
  assert.equal(brassDimensionTolerance('square',20,{...o,accuracy:'high'}),null)
  const {getWeightTolerance}=a.load('src/data/gost')
  assert.equal(getWeightTolerance('rod',{d:20},'Латунь',o).minus,r.minus)
  assert.equal(getWeightTolerance('square',{a:20},'Латунь',o).minus,r.minus)
  assert.equal(getWeightTolerance('rod',{d:20},'Алюминий',o),null)
})

test('pressed brass table includes boundaries and rejects unavailable products', () => {
  const a=app(); const {brassDimensionTolerance:d,brassAvailabilityError:e}=a.load('src/data/brassTolerance')
  const o={manufacturing:'pressed',accuracy:'normal'}
  for(const [size,delta] of [[10,.29],[10.01,.35],[18,.35],[18.01,.42],[30,.42],[50,.5],[80,.6],[100,.7],[120,1.1],[160,1.25],[180,1.4]]) assert.equal(d('rod',size,o),delta)
  assert.equal(d('rod',181,o),null)
  assert.equal(d('rod',50,{...o,accuracy:'increased'}),.31)
  assert.equal(d('square',30,{...o,accuracy:'increased'}),.26)
  assert.ok(e('square',18,o)); assert.ok(e('square',31,{...o,accuracy:'increased'}))
  assert.ok(e('hexagon',101,o)); assert.equal(e('hexagon',100,o),null)
  let c=a.render(); c.selectMetal('Латунь','Л63'); c.selectProfile('square'); c.setParam('a',10);c.setLength(1);c.setBrassOptions(o);c.calculate('mass');c=a.render()
  assert.equal(c.state.result,null);assert.match(c.state.error.message,/не предусматривает/)
})

test('GOST plate mass uses published A.1 once and the B.1 alloy coefficient in both directions', () => {
 const a=app(),{calcMass,calcLength}=a.load('src/lib/calculations')
 const input={profileKey:'plate',params:{t:20,b:1200},metalGroup:'Алюминий',grade:'Д16Т',quantity:3,length:2}
 const r=calcMass(input)
 assert.equal(r.plateBasis.referenceMass,71.25);assert.equal(r.plateBasis.coefficient,.976)
 assert.equal(r.linearDensity,69.54);assert.equal(r.mass,417.24);assert.equal(calcLength(r.mass,input),2)
 assert.equal(calcMass({...input,grade:'В95'}).linearDensity,71.25)
 assert.ok(Math.abs(calcMass({...input,grade:'АД31'}).linearDensity-67.47375)<.0001)
 assert.equal(calcMass({...input,plateOptions:{accuracy:'high'}}).mass,r.mass)
 const dimensions=calcMass({...input,params:{t:20,b:1000}})
 assert.equal(dimensions.plateBasis.method,'dimensions');assert.equal(dimensions.linearDensity,58.4136)
})
test('GOST plate size limits, accuracy boundaries and unsupported grades are explicit', () => {
 const {plateBasis:b,plateCoefficient:k,plateReferenceMass:r}=app().load('src/data/aluminumPlate')
 assert.match(b('Д16',4,1200),/Лист/);assert.match(b('Д16',10.5,1200),/10,5/)
 assert.equal(b('Д16',12,1200).thicknessMin,11.5)
 assert.equal(b('Д16',20,1500,{accuracy:'high'}).thicknessMin,19.3)
 assert.equal(b('Д16',20.01,1500,{accuracy:'high'}).thicknessMin,19.21)
 assert.equal(b('Д16',20,1500.01).thicknessMin,19)
 assert.match(b('Д16',20,2500),/2000/);assert.match(b('АМг6',45,2500),/2000/)
 assert.equal(b('АМг6',45.01,2500).widthMax,2600)
 assert.match(b('1565ч',60.01,1200),/60/)
 for(const grade of ['6061','6082','7075 (В95)','АК4']){assert.equal(k(grade),null);assert.match(b(grade,20,1200),/коэффициента/)}
 assert.equal(k('Д1'),.982);assert.equal(k('АД31'),.947);assert.equal(k('АМг6'),.926)
 assert.equal(r(11,1500),49.593);assert.ok(b('В95',11,1500).warning)
 assert.equal(r(22,1800),115.45);assert.equal(r(20,1250),null)
})
test('GOST plate options survive history, distinguish records and keep sheet settings separate', () => {
 const a=app();let c=a.render();c.selectMetal('Алюминий','Д16Т');c.selectProfile('plate');c.setParam('b',1200);c.setLength(3);c.calculate('mass');c=a.render()
 assert.equal(c.state.result.value,208.62);assert.ok(c.state.result.plateBasis)
 const normal=c.state.history[0];assert.deepEqual(normal.plateOptions,{accuracy:'normal'});assert.equal(normal.sheetOptions,undefined)
 c.setPlateOptions({accuracy:'high'});c.calculate('mass');c=a.render();assert.equal(c.state.history.length,2)
 c.restoreFromHistory(normal);c=a.render();assert.equal(c.state.plateOptions.accuracy,'normal');c.calculate('mass');c=a.render();assert.equal(c.state.result.value,208.62)
 c.selectProfile('sheet');c.setParam('t',4);c.calculate('mass');c=a.render();assert.ok(c.state.result.sheetBasis);assert.equal(c.state.result.plateBasis,undefined)
})

