# AGENTS.md

## Ship

Ship profile: `gate-only`

**Integration: branch → PR → merge on green `CI / ci`.** `/ship` merges per `skills/ship/references/git-discipline.md` → Merge a same-repo self PR (read the installed `/ship` reference). Agents never push to `main`, change rulesets, or admin-merge.

Local gate before push: `npm run gate` (full working-tree checks, including an empty index).

**Deploy:** `none` — tutorial notebooks; nothing deploys.

## Purpose

Pandas / GeoPandas / STAC tutorial notebooks at the repo root, with sample vector data under `data/` and `geopandas_data.zip`. Cell outputs are part of the tutorials and stay committed.

## Commands

```bash
npm ci                              # gate tooling (markdownlint; pinned Actions binaries)
npm run gate                        # full local gate, including an empty index
npm run check:md                    # markdown lint
npm run check:actions               # actionlint + shellcheck
npm run check:notebooks             # every tracked .ipynb is well-formed nbformat 4 JSON
```

## Git hooks

`core.hooksPath` is the dotagents dispatcher `~/.local/share/dotagents/hooks`, installed and set by the dotagents installers. Never point it at `.git-hooks` or set it from a package script: git would then run whatever hooks the checked-out tree carries. The dispatcher serves only `pre-commit`, and runs this repo’s tracked `.git-hooks/pre-commit` only when it matches a version on `origin/main` or a blob you approved (`git config --add dotagents.trustedHook <blob>`, printed by the refusal; approve only your own edit). Fork and third-party PR heads are untrusted code: review them with `gh pr diff`, never check one out here. Canon: dotagents `rules/agent-cloud-access.md` → GitHub.

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

## AWS

n/a — no AWS resources or deploy. The Cloud `environment.json` install is skills-only and does not
run `.cursor/aws-oidc-login.sh`, so the `.cursor/CLOUD.md` "AWS reads" setup (AWS CLI,
`AWS_PROFILE=agent-readonly`) is absent on this repo's Cloud Agents.

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

## Fleet rollout

Changes inside this repo ship normally. For changes other repos must adopt, link the merged PR on the one existing dotagents Todoist fleet-rollout task. Do not start that rollout or spawn per-repo chips, PRs or tasks from here. John authorizes one lead to walk the fleet after canon settles. Follow the installed `persist-todos-in-todoist` skill → Fleet rollout.
