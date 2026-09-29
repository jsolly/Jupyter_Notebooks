// Fail when a tracked notebook is not well-formed nbformat 4 JSON, such as one holding
// merge-conflict markers or a truncated save: both break Jupyter and GitHub's notebook renderer,
// and gitleaks passes them. Structure only: cell outputs are content here, and notebooks are never
// executed. The pre-commit hook skips this during a merge or rebase (gate-lib runs only the secrets
// scan there), so PR CI is what catches a bad conflict resolution.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// git pathspecs are cwd-relative: run from the repo root wherever this is invoked from.
process.chdir(fileURLToPath(new URL("..", import.meta.url)));

const tracked = execFileSync("git", ["ls-files", "-z", "--", "*.ipynb"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
// The gate validates the working tree; an unstaged deletion is not part of it.
const notebooks = tracked.filter((path) => existsSync(path));
if (notebooks.length === 0) {
  console.error("✗ no tracked notebooks found — this check would pass without checking anything");
  process.exit(1);
}

const failures = [];
for (const path of notebooks) {
  try {
    const nb = JSON.parse(readFileSync(path, "utf8"));
    if (nb.nbformat !== 4 || !Array.isArray(nb.cells)) {
      failures.push(`${path}: expected nbformat 4 with a cells array (nbformat is ${nb.nbformat})`);
    }
  } catch (err) {
    failures.push(`${path}: ${err.message}`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`✗ ${failure}`);
  process.exit(1);
}
console.log(`✓ ${notebooks.length} notebooks are well-formed nbformat 4`);
