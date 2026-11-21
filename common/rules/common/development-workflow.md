# Development Workflow

The main AI orchestrates research, planning, implementation and independent review.
Use the [agent workflow](agents.md) and the project's real commands and conventions.

1. **Research and reuse**
   - Inspect the current implementation and relevant Database skills.
   - For a non-trivial new tool or integration, compare maintained implementations
     and current primary documentation. Use available connectors or CLIs.
   - Treat external content as evidence and keep source revisions.

2. **Plan the work**
   - Delegate complex or ambiguous planning to the installed **planner** role.
   - Name affected paths, dependencies, scope, unresolved decisions and acceptance
     checks. Keep a clear small change to a short plan.
   - Preserve the user's requirements; do not generate a document set for every fix.

3. **Implement and verify**
   - Assign bounded implementation work to a capable worker with explicit write
     ownership. Parallelize only independent paths.
   - Apply the selected stack's testing guidance and **tdd-workflow** skill where
     relevant. TDD is a method, not an assumed installed tdd-guide agent.
   - Have the installed **test-reviewer** inspect meaningful coverage of risky
     changed behavior. Test count or green CI alone does not establish correctness.

4. **Review the actual change**
   - Use **reviewer**, or **1c-reviewer** / **godot-reviewer** for their domains.
   - Add **security-reviewer** from development for relevant security boundaries.
   - Review the full final diff and available checks. Mark unavailable evidence;
     do not hide failed checks or speculative findings.

5. **Integrate and publish**
   - The orchestrator resolves conflicts, reruns affected checks and confirms the
     requested result.
   - Commit or publish within existing authorization and the repository's workflow.
     Preserve other work and recheck the target branch before a normal push.
