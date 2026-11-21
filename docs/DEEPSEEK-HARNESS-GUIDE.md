# DeepSeek Harness Guide

ECC runs on the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH) via its
native skill roots. This guide covers installation and the supported workflow.

Unlike the Qwen or Codex adapters, there is no dedicated installer target yet; the
setup is a small amount of manual configuration described below.

## Prerequisites

- DeepSeek Harness 0.2.0-rc.1 (the verified version; reverify newer releases) (`dsh --version`).
- ECC repository cloned locally, for example `~/ECC`.
- Skills use the native DeepSeek Harness skill loader.

## Skills (automatic)

DSH loads skills from these roots (earlier roots win on name conflicts):

```text
<project>/.dsh/skills
<project>/.agents/skills
custom dirs (~/.dsh/profiles/<profile>/cordis.patch.yml -> skill-filesystem)
~/.dsh/skills
~/.agents/skills
```

Because ECC already ships `.agents/skills/` for Codex, opening a session with the
ECC checkout as the working directory exposes a subset of ECC skills immediately.
To expose the full curated set in every project, link the catalog once:

```bash
ln -s /path/to/ECC/skills/<skill-name> ~/.dsh/skills/<skill-name>
```

Run this per skill with real names substituted for both placeholders (for
example `ln -s ~/ECC/skills/tdd-workflow ~/.dsh/skills/tdd-workflow`); the
angle brackets are placeholders, not shell syntax.

DSH reads `SKILL.md` frontmatter (name/description), which matches the ECC skill
format, so no conversion is needed. Name conflicts with pre-existing user skills
are resolved by root priority; skip those skills when linking.

## Lifecycle hooks

Database lifecycle hook installation is [available for Codex](../hooks/README.md).

## Updating

```bash
cd /path/to/ECC && git pull
```

Linked skills reflect the pull immediately.

## Scope

| Surface | Status on DSH |
|---------|---------------|
| Skills | Native discovery; individual workflows retain their harness prerequisites |
| Commands (slash-command surface) | Not available (Claude Code mechanism); workflows are covered by skills |
| Agents | Native dispatch unverified; use canonical prompt guidance only after review |

The validated setup here targets the CLI/web profile. Desktop profiles have a separate
installation-owned runtime and skill discovery must be verified there independently.
