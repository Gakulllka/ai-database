---
name: database-onboarding
description: Connect a project to Database, choose its Codex skill packs, verify an existing connection, or investigate a gap in the available skills.
license: MIT
---

# Database onboarding

## Determine the intent

- A repository link by itself means inspect the current `database` branch and its START HERE page, then ask one short question about the intended task.
- When the task is clear, select its pack independently. Ask a question only if one missing detail changes the choice. A request to connect Database authorizes setup for the specified project.
- Consult the current `database` revision when no suitable installed skill is known. Read `common/catalog.json`, the selected `pack.json`, and applicable skills from the same commit. Fetch the complete topic folder so its resources are available.
- After connection, a material change of goal calls for a fresh revision and setup of the next relevant pack. Keep the packs already installed.

## Fetch a pinned snapshot

Setup requires Node.js 22 or newer and Git. See the repository's START HERE for the complete commands. For a first checkout use a blob-filtered sparse clone of `database`, then add `common` and the selected topic with `git sparse-checkout add`. Record `git rev-parse HEAD`.

For an existing checkout, run `git fetch origin database` and read `git rev-parse FETCH_HEAD`. Use a new clean detached worktree at that commit, include `common` and the selected topic in sparse checkout, and leave the original branch and working files in place.

## Connect and check the project

Run these commands from the pinned Database root, substituting the exact project path and selected pack IDs.

```text
node common/tools/database.mjs catalog
node common/tools/database.mjs setup --project "<absolute path>" --pack learning
node common/tools/database.mjs check --project "<absolute path>"
```

Repeat `--pack` for multiple packs. Project setup is local and adds `common` and the requested packs. It preserves earlier packs, creates missing bootstrap files needed for the connection, and manages the Database block in `AGENTS.md` and any existing `AGENTS.override.md`. Primary skill content is under `.database/library/<pack>/skills/`. Codex discovers the routes under `.agents/skills/`. Selected roles are installed under `.codex/agents/`.

When the user asks to connect without a project goal, run setup without `--pack` to install the common pack. After verifying setup, name a few directions from the catalog and ask what the user wants to tackle first. When the goal is clear, proceed with the appropriate topic package.

On the first explicitly requested connection, run the authorized global hook step separately with `node common/hooks/install.js`. The user reviews and trusts the definitions in Codex `/hooks`. Use the native trust flow. Keep one registration of each already configured handler. On repeat setup check the result and confirm the selected packs, project, and revision.

## Handle a missing topic or a failed skill

If an instruction fails or there is no relevant skill, investigate the actual task, check primary evidence, and test the proposed method on a concrete case. Extract what can be reused and classify it against the current catalog. Improve the existing skill or add one to a suitable pack. Create a new top-level folder with `pack.json` and a catalog entry only when no topic fits.

Run `node common/tools/database.mjs verify` from a complete checkout. Under the user's existing publication authorization, publish the verified reusable files and necessary catalog changes to `database`. Use public or synthetic examples and new commits that preserve public history. Verify the result on GitHub.
