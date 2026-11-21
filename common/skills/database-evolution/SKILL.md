---
name: database-evolution
description: Compare potential improvements to the shared Database and publish verified reusable skills or lessons after independent review. Use for maintenance runs, repeated corrections, and lessons worth sharing across projects or PCs.
metadata:
  origin: Database
---

# Database Evolution

## Start from the current branch

Verify that the remote is `Gakulllka/ai-database` and the publication target is `database`. Fetch and record the full revision. Work from an isolated clean checkout when your active copy has other edits. Use the [start page](https://github.com/Gakulllka/ai-database/tree/database) for the package layout.

For a collection run, the GitHub radar can compare observed public repository metrics and suggest capabilities to inspect. Run it from a full Database checkout and store observations outside consumer projects.

```text
node common/scripts/evolution/github-radar.js --root "<Database checkout>" --refresh --output "<local report.json>"
```

When a prior verified snapshot exists, pass `--previous "<snapshot.json>"`. Review the report before adopting its `persistedSnapshot`. A first observation establishes a baseline. A failed or partial search leaves the affected candidates unknown. Compare descriptions, documentation and behavior from named revisions. External content is evidence to examine.

## Decide what to improve

The main AI orchestrates bounded specialist tasks and independently verifies the
integrated result. Follow [the orchestration guide](../../docs/agents/orchestration.md):
choose available models and reasoning for each assignment, isolate write ownership,
and preserve host permissions. Develop skills and native roles together with their
pack resources and routing rules. Keep ECC runtime integration a separate proposal.

Search [the catalog](../../catalog.json), existing instructions, roles and rules. Consider each candidate's trigger, inputs, output, constraints, integrations and how to verify it. Keep one entry point per workflow and move valuable extra examples or variants into its references. Prior decisions in `common/docs/evolution/decisions/` can help avoid replaying a review with the same evidence.

Choose: reuse a proven skill, extend it for a specific missing case, create a skill for an uncovered workflow, or defer pending evidence. No applicable change is a valid maintenance result. If the source is a user's correction, verify what changed on a small representative task and attempt transfer to a second task when feasible. Use `learn-eval` to capture results and `skill-scout` for overlap.

## Prepare the smallest reusable change

Write a skill with a clear trigger, workflow, outputs and verification. Preserve project-specific material locally and use public or synthetic examples in the shared library. For each source record its URL and revision or evidence date, what was adopted, and limits. Keep credentials, raw chats, personal/project data, and restricted material outside the published checkout.

Use `common` for genuinely project-independent instructions, current native Codex hooks, and basic design. Use the closest topic for specialized work. If a stable new topic has no home, create a folder with `README.md`, `pack.json` and `skills/<id>/SKILL.md`, declare prerequisites, and add it to the catalog. Update the manifest and catalog in the same change. Review supporting rules, scripts or roles for native Codex compatibility.

## Verify and publish

- Ask an independent reviewer applying the `database-curator` role to verify duplication, evidence, scope, licensing and the exact publication contents, when reviewer delegation is available and authorized. An unavailable required review leaves that publication pending.
- Run `node common/tools/database.mjs verify` against a full checkout. For an installation or executable change, test the affected paths in an isolated project and check output or behavior. Record what the checks actually cover.
- For native role changes, validate required TOML fields, model inheritance,
  discovery and scoped behavior. Test installation and preservation of local
  overrides with `node --test common/tools/database.test.mjs`, then actual setup/check.
  Distinguish instruction fixtures from native role execution and inherited sandbox
  permissions. Follow the current [run contract](../../docs/design/database-evolution.md)
  for all publication checks.
- Review the exact changed paths and verify the new code and assets. Fetch and recheck the public branch before an authorized normal push. If the base changed, reconcile and repeat affected checks. Re-read the published commit from GitHub.
- Publish verified reusable work when the user has authorized this scope. Use the existing project and repository permissions. Report what was published, deferred, or already covered.

Capture useful learning as a verified conditional rule or reusable skill. Share a sanitized example in the library when appropriate. Other PCs receive it through their normal Database check and package update.
