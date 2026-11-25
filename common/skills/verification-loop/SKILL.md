---
name: verification-loop
description: "Verify completed Codex or Claude Code changes with applicable build, type, lint, test, defensive security, diff, and target acceptance checks. Use before declaring delivery complete."
license: MIT
---

# Verification Loop Skill

## Codex workflow

Start with the user's observable success condition and the normal entry point. Choose the project commands that actually validate it. Run build, type, lint and tests when the project provides them and they cover the change. For a generated artifact, open it and exercise its main interaction. Review the diff and perform a scoped defensive check for exposed secrets or unsafe handling when relevant.

Record the exact result of each meaningful check. Distinguish executed success, failure, missing access and inapplicable checks. When reporting that a change is deployed, installed or live, read back the target and exercise the relevant entry point if authorized. Keep local evidence and target evidence separate. If an unrelated failure already exists, reproduce it on the comparison revision when feasible and report its impact.

Capture the verification command's own exit status immediately after direct
execution (`$?` in Bash, `$LASTEXITCODE` for native commands in PowerShell).
If output needs trimming, collect the full log and shorten it after saving the
status. A live pipeline can mask a failure or interrupt a command when the
output filter exits early.

## Claude Code and prior integrations

A comprehensive verification system for Claude Code sessions.

## When to Use

Invoke this skill:
- After completing a feature or significant code change
- Before creating a PR
- When you want to ensure quality gates pass
- After refactoring

## Verification Phases

### Phase 1: Build Verification
```bash
# Check if project builds
npm run build
# OR
pnpm build
```

If build fails, STOP and fix before continuing.

### Phase 2: Type Check
```bash
# TypeScript projects
npx tsc --noEmit

# Python projects
pyright .
```

Report all type errors. Fix critical ones before continuing.

### Phase 3: Lint Check
```bash
# JavaScript/TypeScript
npm run lint

# Python
ruff check .
```

### Phase 4: Test Suite
```bash
# Run tests with coverage
npm run test -- --coverage

# Check coverage threshold
# Target: 80% minimum
```

Report:
- Total tests: X
- Passed: X
- Failed: X
- Coverage: X%

### Phase 5: Security Scan
```bash
# Check for secrets
grep -rn "sk-" --include="*.ts" --include="*.js" . 2>/dev/null | head -10
grep -rn "api_key" --include="*.ts" --include="*.js" . 2>/dev/null | head -10

# Check for console.log
grep -rn "console.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -10
```

### Phase 6: Diff Review
```bash
# Show what changed
git diff --stat
git diff HEAD~1 --name-only
```

Review each changed file for:
- Unintended changes
- Missing error handling
- Potential edge cases

## Target Acceptance

When the requested outcome requires deployment or target-environment verification,
report target acceptance separately from local checks. Record the environment and
installed version when known, the evidence, and the next permitted check or precise
access dependency. Passing local checks, review, merge, or release does not establish
target acceptance. Report VERIFIED or FAILED for an executed target check, with its evidence.
Do not access production or make external changes without authorization. For
local-only tasks, mark target acceptance as not applicable.

For example: local checks PASS; staging verification NOT PERFORMED (no access);
next step: an authorized maintainer runs the staging smoke test.

## Output Format

After running all phases, produce a verification report:

```
VERIFICATION REPORT
==================

Build:     [PASS/FAIL]
Types:     [PASS/FAIL] (X errors)
Lint:      [PASS/FAIL] (X warnings)
Tests:     [PASS/FAIL] (X/Y passed, Z% coverage)
Security:  [PASS/FAIL] (X issues)
Diff:      [X files changed]

Overall:   [READY/NOT READY] for PR
Target:    [VERIFIED/FAILED/NOT PERFORMED/NOT APPLICABLE] (environment/version, evidence)
Next permitted step: [check or access dependency; none if complete/not applicable]

Issues to Fix:
1. ...
2. ...
```

## Continuous Mode

For long sessions, run verification every 15 minutes or after major changes:

```markdown
Set a mental checkpoint:
- After completing each function
- After finishing a component
- Before moving to next task

Run: /verify
```

## Integration with Hooks

This skill complements PostToolUse hooks but provides deeper verification.
Hooks catch issues immediately; this skill provides comprehensive review.
