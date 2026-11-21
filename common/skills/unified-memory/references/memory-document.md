# Portable memory document

Use JSON-valued YAML frontmatter with a Markdown body. Preserve the same field names, lowercase identifiers, UTC timestamps and link semantics when continuing a compatible vault. This is a synthetic example.

```markdown
---
schema: "database.memory.v1"
id: "mem_20260726_01k123example"
title: "Authentication migration handoff"
kind: "handoff"
scope: "project"
trust: "unreviewed"
status: "active"
source_harness: "codex"
target_harnesses: ["codex"]
tags: ["auth", "migration"]
links: []
created_at: "2026-07-26T20:00:00.000Z"
updated_at: "2026-07-26T20:00:00.000Z"
---

The synthetic migration tests pass. The remaining task is to review rollout acceptance.
```

The traditional project locations are `<repo>/.database/memory/project/` for local records and `<repo>/.database/memory/team/` for approved shared records. The user scope traditionally lives under `~/.database/memory/` and requires deliberate selection. Local conventions or configured paths take precedence.

New records start active and unreviewed. Ordinary recall uses current active records. Follow an explicit link when historical context is requested, then inspect status before citing it. A supersession link is evidence of a relationship and does not alone replace the old status. Verified decisions belong in their governed artifact, such as a decision record or confirmed workflow.

When the old runtime is available, prefer its existing save/search/read/doctor operations after verifying the target. The portable Markdown fallback preserves the document shape but provides no automatic indexing or replication.
