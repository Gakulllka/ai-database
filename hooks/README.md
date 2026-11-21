# Codex lifecycle hooks

Database ships one standalone lifecycle-hook set for Codex. Review its installation plan from the repository root.

```sh
node scripts/codex/install-database-hooks.js --dry-run
node scripts/codex/install-database-hooks.js
```

The installer uses `CODEX_HOME` or the default user configuration directory. Pass `--home` with an absolute directory to select another Codex installation. It merges the Database entries into `hooks.json` and copies the local dispatcher. Existing unrelated user entries stay in place. Restart or open a new Codex session, then review and trust the definitions in `/hooks`.

| When | What Database checks |
| --- | --- |
| After context compaction | Reminds Codex to resume the next unfinished step and check running work before retrying. |
| Before a shell command | Reminds Codex to check the target and scope of potentially destructive Git operations. |
| Before applying a patch | Flags added lines that resemble credentials or private keys. |
| After applying a patch | Flags apparent conflict markers or debug statements added by the patch. |
| After a shell command | Flags an unsuccessful verification command so the failure can be explained before delivery. |

On Windows the standalone commands use the default PowerShell shell. The checks give advisory messages for supported native tool events and recognizable exit results. Codex approvals and project permissions still apply. The [optional native Codex plugin](../.codex-plugin/README.md) has a separate session startup hook. The [compaction recovery definition](codex-compaction-recovery.json) is included by the standalone installer.

Database supplies lifecycle registrations only for Codex. Other adapters continue to provide their supported skills, tools and commands. Git hooks and scripts bundled as explicit skill examples remain separate.
