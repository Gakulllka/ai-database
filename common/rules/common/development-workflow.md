# Development Workflow

The main AI orchestrates research, planning, implementation and independent review.
Use the [agent workflow](agents.md) and the project's real commands and conventions.

1. **Research and reuse**
   - Inspect the current implementation and relevant Database skills.
   - For a non-trivial new tool or integration, compare maintained implementations
     and current primary documentation. Use available connectors or CLIs.
   - Treat external content as evidence and keep source revisions.

2. **Plan the work**
   - Use **architect** when module boundaries, storage, interfaces or lifecycle
     choices change. Keep business constraints grounded in approved requirements.
   - Delegate complex or ambiguous planning to the installed **planner** role.
   - Name affected paths, dependencies, scope, unresolved decisions and acceptance
     checks. Keep a clear small change to a short plan.
   - Preserve the user's requirements; do not generate a document set for every fix.

3. **Implement and verify**
   - Assign **implementation-worker** the actual stack/skills, bounded write paths,
     permitted commands and artifact locations. Parallelize only independent paths
     after agreeing interfaces.
   - Apply the selected stack's testing guidance and **tdd-workflow** skill where
     relevant. TDD is a method, not an assumed installed tdd-guide agent.
   - Have the installed **test-reviewer** inspect meaningful coverage of risky
     changed behavior. Test count or green CI alone does not establish correctness.

4. **Review the actual change**
   - Use **language-reviewer** for actual stack-specific issues; prefer domain
     reviewers for 1C and Godot. Do not duplicate identical review coverage.
   - Use **reviewer**, or **1c-reviewer** / **godot-reviewer** for their domains.
   - Add **security-reviewer** from development for relevant security boundaries.
   - Review the full final diff and available checks. Mark unavailable evidence;
     do not hide failed checks or speculative findings.

5. **Integrate and publish**
   - Delegate agreed user journeys on the integrated build to **e2e-runner** in
     the authorized test environment. Return failures to the code owner, then
     repeat affected checks. Keep product fixes separate from E2E evidence.
   - The orchestrator resolves conflicts, reruns affected checks and confirms the
     requested result.
   - Commit or publish within existing authorization and the repository's workflow.
     Preserve other work and recheck the target branch before a normal push.
