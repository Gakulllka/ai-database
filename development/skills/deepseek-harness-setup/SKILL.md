---
name: deepseek-harness-setup
description: "Read compatibility notes for a legacy DeepSeek Harness installation on explicit request. Use for identifying an old dependency or diagnosing a read-only migration to Codex."
metadata:
  origin: Database
---

# DeepSeek Harness Compatibility

Use this entry to identify a legacy installation the user explicitly named. Treat a previous host's hooks and package commands as historical inputs when migrating to current Database.

- In the named project, inspect the existing skill roots and declared integration. Record the observed host, version and config location that affects the migration.
- On Codex, open the current Database onboarding instructions and check the selected skill pack and project root. Confirm that Codex discovers the intended skill with one ordinary read-only use.
- When the task concerns configuring a model, verify the current client's supported provider, tools and authorization with its actual setup and current official documentation. Keep credentials in the configured secret store.
- If a previous cross-host bridge matters, capture the supported behavior to preserve and compare it with the actual Codex equivalent. Change runtime registration only within an explicitly authorized scope.
