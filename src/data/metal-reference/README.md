# Metal Reference Compact Seed

This directory contains a partial compact seed for the future metal designation decoder.

It is not a full ГОСТ database. It was created from the reviewed source-layer file `reference-sources/verified-metal-facts.json`, which in turn uses only 7 primary source cards:

- ГОСТ 7417-75
- ГОСТ 4543-2016
- ГОСТ 1051-73
- ГОСТ 14955-77
- ГОСТ 2590-2006
- ГОСТ 19903-2015
- ГОСТ 19904-90

Raw ГОСТ PDFs, OCR text, tables, chemical compositions, mechanical properties, and full assortment tables are not included in this client-facing seed.

## Confidence

`verified` means the compact item is supported by the reviewed source facts at a safe source-type or token level.

`contextual` does not mean verified. It means the token can be useful for the decoder, but its exact interpretation depends on the full designation, cited ГОСТ, order context, or manual review. Contextual records keep `displayWarning` and must not be displayed as hard ГОСТ conclusions.

This seed intentionally contains no `unknown` records because the source facts contained no `unknown` facts.

## Files

- `gosts.compact.json`: compact references for the 7 primary ГОСТs.
- `product-types.compact.json`: product forms and safe assortment contexts.
- `designation-tokens.compact.json`: contextual designation tokens for the first test example.
- `parser-rules.compact.json`: safe recognition patterns only, not a parser implementation.

`grades.compact.json` is intentionally not created yet. The token `30ХГСА` remains contextual until a reviewed source-card confirms the exact grade row and any future grade facts.

## Covered Test Example

```text
Круг h11-7,0 ГОСТ 7417-75 / 30ХГСА-В-ТО ГОСТ 4543-2016
```

Covered as a partial seed:

- `Круг`: verified product form.
- `h11`: contextual tolerance-field token.
- `7,0`: contextual decimal-comma dimension.
- `ГОСТ 7417-75`: verified product-standard reference.
- `30ХГСА`: contextual steel-grade token.
- `В`: contextual modifier.
- `ТО`: contextual delivery-condition token.
- `ГОСТ 4543-2016`: verified material-standard reference.

## Next Steps

1. Manually review blocked contextual tokens and update source cards where needed.
2. Add a parser layer that consumes these compact files without changing confidence levels.
3. Add UI display rules that preserve contextual warnings.
4. Extend source-card coverage beyond the 7 primary ГОСТs.
5. Create grade facts only after reviewed source evidence, without copying chemistry tables.
