import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { readFileSync } from 'node:fs'

const require = createRequire(import.meta.url)
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const parserPath = resolve(rootDir, 'src/lib/metalDesignationParser.ts')
const parserSource = readFileSync(parserPath, 'utf8')

const transpiled = ts.transpileModule(parserSource, {
  compilerOptions: {
    esModuleInterop: true,
    module: ts.ModuleKind.CommonJS,
    resolveJsonModule: true,
    target: ts.ScriptTarget.ES2020,
  },
  fileName: parserPath,
})

const module = { exports: {} }
const localRequire = request => {
  if (request.startsWith('../')) return require(resolve(dirname(parserPath), request))
  return require(request)
}

new Function('require', 'module', 'exports', transpiled.outputText)(localRequire, module, module.exports)

const { parseMetalDesignation } = module.exports
const input = 'Круг h11-7,0 ГОСТ 7417-75 / 30ХГСА-В-ТО ГОСТ 4543-2016'
const result = parseMetalDesignation(input)

const byRaw = new Map(result.tokens.map(token => [token.raw, token]))
const expected = [
  ['Круг', 'product-form', 'verified'],
  ['h11', 'tolerance-field', 'contextual'],
  ['7,0', 'dimension', 'contextual'],
  ['ГОСТ 7417-75', 'product-standard', 'verified'],
  ['30ХГСА', 'steel-grade', 'contextual'],
  ['В', 'contextual-modifier', 'contextual'],
  ['ТО', 'delivery-condition', 'contextual'],
  ['ГОСТ 4543-2016', 'material-standard', 'verified'],
]

for (const [raw, type, confidence] of expected) {
  const token = byRaw.get(raw)
  assert.ok(token, `Missing token: ${raw}`)
  assert.equal(token.type, type, `${raw}: type`)
  assert.equal(token.confidence, confidence, `${raw}: confidence`)
  if (confidence === 'contextual') assert.ok(token.displayWarning, `${raw}: contextual token must have displayWarning`)
}

assert.deepEqual(
  result.tokens.map(token => token.raw),
  expected.map(([raw]) => raw),
  'Token order should match designation order',
)
assert.equal(result.unknownTokens.length, 0, 'Test designation should not produce unknown tokens')
assert.equal(result.parts.length, 2, 'Designation should be split into two slash-separated parts')

console.log(JSON.stringify({
  input,
  tokens: result.tokens.map(token => ({
    raw: token.raw,
    normalized: token.normalized,
    type: token.type,
    confidence: token.confidence,
    sourceGosts: token.sourceGosts,
    displayWarning: token.displayWarning,
    span: token.span,
  })),
  unknownTokens: result.unknownTokens,
  candidateNormalizations: result.candidateNormalizations,
}, null, 2))
