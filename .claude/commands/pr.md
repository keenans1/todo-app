Create a pull request for the current branch's changes.

1. Check git status — if there are uncommitted changes, stage and commit them with a message derived from the work done
2. Ensure the branch is pushed to origin (push with `-u` if no upstream yet)
3. Create a PR using `gh pr create` targeting `main` with:
   - A concise title (under 70 characters)
   - Summary bullets describing what changed and why
   - A test plan checklist
   - Footer: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`
4. Return the PR URL

Follow the rules in `.claude/skills/git/SKILL.md`:
- Never force-push
- Never skip hooks
- Never push directly to `main`
- Commit messages: lead with the "why", append `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`, pass via heredoc
