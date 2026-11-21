---
description: Run the ECC formatter quality gate for a single file and report remediation steps.
---

# Quality Gate Command

Run the project formatter for one requested file. The standalone command accepts `tool_input.file_path` as JSON on stdin.

- JavaScript, TypeScript, JSON and Markdown use the project's configured Biome or Prettier.
- Go uses `gofmt`. Python uses `ruff format`.
- Check without editing. Set `ECC_QUALITY_GATE_FIX=true` only when formatting changes are requested.

```sh
printf '%s\n' '{"tool_input":{"file_path":"src/example.ts"}}' | ECC_QUALITY_GATE_STRICT=true node scripts/hooks/quality-gate.js
```

Report what the formatter found. Use `verification-loop` for project lint, type checks or tests.

## Arguments

$ARGUMENTS:

- `[path]` optional file to check. Pass it as `tool_input.file_path` in the input JSON.
