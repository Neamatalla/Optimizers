---
name: git-sync
description: Merge a teammate's branch into staging or main, safely. Previews the merge, explains every conflict in plain words, and asks the user how to resolve anything that touches behaviour or business logic. Use when the user runs /git-sync or asks to merge, sync or bring a branch into staging or main.
argument-hint: <branch> <staging|main>
disable-model-invocation: true
---

# git-sync

Merge `<branch>` into `<target>` (`staging` or `main`). Arguments: `$ARGUMENTS`

Anyone can merge. The hard part is knowing which version of the code is right when branches disagree. Your job is to understand both sides, explain them, and ask. **Never decide business logic yourself.** When in doubt, ask.

Running this skill is the user's explicit request to merge, so the "changes go through a PR" rule in `docs/WORKFLOW.md` doesn't apply here. Everything else in that file does, including: no Claude attribution in commits.

## 1. Check the inputs

- Need a branch and a target. If either is missing, ask.
- Target must be `staging` or `main`. For `main`, confirm once more before starting: "Merge `<branch>` into `main` (production)?"
- The working tree must be clean (`git status --porcelain`). If not, stop and ask what to do with the changes. Never stash or discard them on your own.

## 2. Get up to date

```
git fetch --all --prune
```

- Both `origin/<branch>` and `origin/<target>` must exist. If not, say so and stop.
- Bring local `<target>` up to date: `git switch <target>` then `git pull --ff-only`. If that fails (local and remote have split), stop and ask.
- Always merge `origin/<branch>`, not a local copy, so you get the teammate's latest work.

## 3. Understand the branch before merging

Find the shared starting point: `base=$(git merge-base <target> origin/<branch>)`.

Look at:
- `git log --oneline <target>..origin/<branch>`: what the branch brings, and who wrote it (`--format='%h %an %ad %s' --date=short`).
- `git log --oneline origin/<branch>..<target>`: what landed on the target since the branch was made.
- `git diff --stat <base> origin/<branch>`: which files the branch changes.

Flag these to the user before going on:
- **Nothing to merge:** the branch is already in the target. Stop.
- **Wrong base:** merging into `staging` but the branch contains `main` commits that `staging` doesn't have. It was probably branched from `main`.
- **Old branch:** the target has moved a lot since the branch was made (many commits, or weeks old). Conflicts and hidden breakage are more likely.
- **Database migrations:** the branch adds folders in `supabase/migrations/`. Check them against `docs/DB_WORKFLOW.md` (see step 6).

Then tell the user in 2–4 plain lines what the branch does and who worked on it.

## 4. Preview the merge (touches nothing)

```
git merge-tree --write-tree --name-only <target> origin/<branch>
```

Exit code 0 means no conflicts. Exit code 1 means conflicts: the lines after the first one list the conflicted files, and the messages after the blank line say the conflict type (content, modify/delete, rename…).

Tell the user the result: "No conflicts" or "N files conflict: …".

## 5. Merge and analyse each conflict

```
git merge --no-ff --no-commit origin/<branch>
```

Nothing is committed or pushed yet. `git merge --abort` undoes it at any point.

For each conflicted file, understand **why** each side changed it before touching it:
- `git log --format='%h %an %ad %s' --date=short <base>..<target> -- <file>`: the target's changes and their reasons.
- Same with `<base>..origin/<branch>`.
- `git diff <base> <target> -- <file>` and `git diff <base> origin/<branch> -- <file>`: what each side actually did.
- Read the surrounding code, and anything that calls it, so you know what each version does at runtime.

Then sort each conflict into one of these:

| Kind | Example | What to do |
|---|---|---|
| **Both sides add separate things** | Two new imports, two new list items, two new functions | Keep both. Show the result; no question needed unless order matters. |
| **Formatting only** | One side reformatted, the other changed nothing real | Take the real change. Mention it. |
| **Same fix, written twice** | Both people fixed the same bug differently | Ask which to keep. Recommend one and say why. |
| **Structure vs behaviour** | One side moved, renamed or refactored the code; the other changed what it does | Usually: keep the new structure and re-apply the behaviour change inside it. Ask to confirm. |
| **Different business logic** | Different prices, rules, copy, conditions, limits or flows for the same feature | **Always ask.** Never pick one yourself. |
| **Deleted on one side, changed on the other** | One person removed a file the other edited | Ask: was the deletion meant to drop that feature too? |
| **Lock files** | `package-lock.json` | Don't hand-merge. Resolve `package.json` first, then rebuild the lock with `npm install --package-lock-only` (in the right folder). |
| **Generated files** | Build output, compiled assets | Regenerate rather than merge. |

### How to ask

Use AskUserQuestion. One question per real conflict, up to 4 per call. For each:
- Name the file and what the code does, in plain words.
- Say what each side does differently and **what the user or customer would see** with each.
- Say who made each change, when, and the commit message (their reason).
- Show both versions in the option previews, short.
- Offer: keep the target's version, keep the branch's version, combine them (say exactly how), and stop to ask the author.
- Put your recommendation first, marked "(Recommended)", only when you have a real reason. Say the reason.

Good questions to raise when they apply:
- Which business rule is current? Did one person not know about the other's change?
- Is the infrastructure change (refactor, new structure, renamed config) meant to replace the old behaviour, or just reorganise it?
- Are these two versions of the same feature? Which one did the team agree on?
- Does one change depend on something else on its branch (a migration, an env variable, an API change) that isn't in the target yet?

If the user picks "stop and ask the author": `git merge --abort`, then write a short note they can send the author: which file, both versions, and the exact question.

## 6. Check for problems without conflict markers

Git can merge cleanly and still break things. Check:
- **Migrations:** two branches adding `supabase/migrations/` folders with the same date and number, or out of order. Follow `docs/DB_WORKFLOW.md`. Renumbering is only safe for a migration not yet applied anywhere (its README boxes are unticked). If it's applied, ask.
- **Renamed or removed code** that the other side still uses. The build and tests catch most of this.
- **Duplicate work:** both sides added the same feature in different places.
- **Translations:** new English UI text with no Arabic entry in `src/app/translations/ar.ts`. Mention it; don't block on it.

## 7. Test

Run `npm test` and `npm run build`. If `audit-worker/` changed, also run `npm test` and `npm run build` inside `audit-worker/` (the build is its type check).

If anything fails, find out whether the merge caused it (compare with the target alone), explain, and ask how to fix it. Don't commit a broken merge.

## 8. Confirm, commit, push

Show a short summary:
- What the branch brings (from step 3).
- Each conflict and how it was resolved.
- Test and build results.
- Anything left for later (missing translations, a migration to run, a question for the author).

Ask: "Commit and push to `<target>`?" Only on yes:

```
git commit -m "Merge <branch> into <target>" -m "<one line per resolved conflict, if any>"
git push origin <target>
```

Then ask whether to delete the merged branch (local and remote). Never delete it without a yes.

## Never

- Never push without the user's yes.
- Never force-push, `reset --hard`, or rewrite history.
- Never decide business logic on your own.
- Never resolve a conflict by dropping one side without saying so.
- Never merge into `main` without the extra confirmation.
- Never add Claude as author or co-author.
