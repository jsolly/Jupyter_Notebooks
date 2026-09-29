# AGENTS.md

## Ship

Ship profile: `gate-only`

**Integration: branch → PR → merge on green `CI / ci`.** `/ship` opens the PR and
merges it once `ci` passes on the head — native auto-merge where the base branch's
ruleset requires `ci`, otherwise a head-pinned manual squash
(`~/code/dotagents/skills/ship/references/git-discipline.md` → Server-side gate).
Agents never push to `main`, change rulesets, or admin-merge.

**CI owner: local.** Agent runs the full local gate before push; `/ship` babysits
GitHub CI on the PR until merge (watch failures and fix forward). There is no
fire-and-forget path.

Local gate before push: `npm run gate` (full working-tree checks, including an empty index).

**Deploy:** `no-http-release-id (n/a)` — tutorial notebooks; nothing deploys.

## Purpose

Pandas / GeoPandas / STAC tutorial notebooks at the repo root, with sample vector data under `data/` and `geopandas_data.zip`. Cell outputs are part of the tutorials and stay committed.

## Commands

```bash
npm ci                              # gate tooling (markdownlint, actionlint)
npm run gate                        # full local gate, including an empty index
npm run check:md                    # markdown lint
npm run check:actions               # actionlint + shellcheck
npm run check:notebooks             # every tracked .ipynb is well-formed nbformat 4 JSON
```

Git hooks: `git config core.hooksPath .git-hooks` (set once per clone).

## Notebook gate

The gate treats notebooks as content, not code:

- **Secrets scan:** gitleaks scans staged changes locally and the PR or push range in CI, over
  cell sources and outputs alike. `.gitleaks.toml` adds notebook-JSON rules on top of the
  defaults; its comments say what each one catches that the defaults miss.
- **Structure:** `check:notebooks` fails on a notebook that is not valid nbformat 4 JSON, such as
  one with merge-conflict markers or a truncated save.
- **Not gated:** notebooks are never executed (they need the GeoPandas stack and the sample
  data), and outputs are never stripped.

## Local UI verification

No user-facing web UI: browser smoke is n/a.

## Verified-tree CI

PRs run the full CI suite. Post-merge CI reuses a successful PR run only when
its recorded checkout tree exactly matches the landed tree, using
`scripts/ci-verified-tree.sh` from dotagents. Missing proof runs full CI;
manual runs always validate. Job names and deployment triggers stay intact.
Canonical contract: `~/code/dotagents/templates/github/verified-tree-ci.md`.

## Dependabot CI

Dependabot PR events allocate no validation runners until a manually invoked
`/optimize-workspaces drain` applies the `ow-ci` label. Only the `labeled` event
that adds `ow-ci` runs the real `ci` check. A later Dependabot push defers again
until a drain re-kicks the new head (remove, then re-add `ow-ci`). Deferred runs
report `ci-deferred` and cannot satisfy the required `ci` check. Skipped or
absent checks never authorize a dependency merge. See the Dependabot CI kick in
the canonical `dotagents/skills/optimize-workspaces/references/pr-drain.md`.
