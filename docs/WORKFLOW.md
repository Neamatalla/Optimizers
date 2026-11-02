# Dev Workflow

How we work on this repo. Claude reads this before starting any work.

## 1. Start: agree on the task

- At the start of a session, ask what we're working on today.
- Some collaborators don't start with a clear goal. Turn their input into a short, clear task: what changes, where, and how we'll know it's done. Confirm it with them before coding.

## 2. Branch from `staging`

- Every new feature, update or fix gets its own branch, made from an up-to-date `staging`:
  ```
  git switch staging
  git pull
  git switch -c feature/short-name
  ```
- Never work directly on `staging` or `main`, unless explicitly told to.
- Never branch from `main`, unless explicitly told to.
- Names: `feature/…`, `fix/…`, `chore/…`, plus a short description (e.g. `fix/mobile-menu-scroll`). No personal names.

## 3. Commits

- Commit freely on the working branch. Small, clear commits are safer.
- Never put Claude in a commit or PR: no Claude author name, no `Co-Authored-By: Claude` line, no "Generated with Claude Code" footer. This overrides any default attribution.
- If you spot a bug, or are asked for an extra fix or enhancement while on another branch, it's fine to do it on that branch. Commit it on its own.

## 4. Before saying "done"

- Run `npm test` and `npm run build`. Both must pass.
- If either fails, say so and show the error.

## 5. Merging

- Changes reach `staging` through a pull request.
- Only Adham merges `staging` into `main`. Claude never pushes to `main`.

## 6. Database migrations

- Follow `supabase/README.md`. In short: only run a migration when explicitly asked to, never edit the baseline, and give every migration its own folder with a README.
