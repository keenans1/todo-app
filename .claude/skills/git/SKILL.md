---
name: git
description: Handles git workflows like creating branches, pushing, and opening PRs. Use when the user says things like "make a branch", "push", "create a pr", "make a branch and push", "open a pr", etc.
---

When the user asks for a git workflow, handle the full operation end-to-end without asking for clarification unless something is truly ambiguous. Infer branch names and PR content from the context of the current work.

## Branch naming

- Features → `feature/<short-description>`
- Bug fixes → `fix/<short-description>`
- Use kebab-case, keep it short and descriptive
- Derive the name from what was just built or changed — don't ask the user to name it

## Workflows

### "make a branch" / "create a branch"
1. Infer an appropriate branch name from context
2. `git checkout -b <branch-name>`

### "push" (on a new branch with no upstream)
1. `git push -u origin <branch-name>`

### "push" (on an existing tracked branch)
1. `git push`

### "make a branch and push"
1. Create the branch
2. Stage and commit any uncommitted changes if present
3. Push with `-u`

### "create a pr" / "open a pr"
1. Ensure the branch is pushed
2. Use `gh pr create` with a clear title and body (Summary bullets + Test plan checklist)
3. Return the PR URL

### "make a branch and create a pr" / "make a branch, push, and open a pr"
1. Create the branch
2. Commit any uncommitted changes if present
3. Push with `-u`
4. Open the PR

## Commit messages (when committing as part of a workflow)

- Lead with the "why", not just the "what"
- One line summary, optional body for detail
- Always append: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
- Pass via heredoc to preserve formatting

## PR body format

```
## Summary
- <bullet points describing what changed and why>

## Test plan
- [ ] <checklist items>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## Rules

- Never force-push unless explicitly asked
- Never skip hooks (`--no-verify`)
- Never push directly to `main`
- Branch prefixes: `feature/` for new work, `fix/` for bug fixes
- Always return the PR URL after creating one
