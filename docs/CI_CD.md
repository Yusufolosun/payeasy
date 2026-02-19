# CI/CD Process

## Overview

This project uses **GitHub Actions** to automatically run quality checks on every push and pull request. Three independent workflows enforce code quality before changes are merged.

## Workflows

| Workflow | File | Trigger | What it does |
|----------|------|---------|--------------|
| **Lint** | `.github/workflows/lint.yml` | Push to `main`/`develop`, PRs | Runs `npm run lint` (ESLint via Next.js) |
| **Build** | `.github/workflows/build.yml` | Push to `main`/`develop`, PRs | Runs `npm run build` across all workspaces |
| **Test** | `.github/workflows/test.yml` | Push to `main`/`develop`, PRs | Runs `npm run test --if-present` |

All workflows use **Node.js 20** with npm caching for fast installs.

## Branch Protection Rules (Manual Setup)

Configure these in **GitHub → Settings → Branches → Add rule** for `main`:

1. ✅ **Require a pull request before merging**
2. ✅ **Require status checks to pass before merging**
   - Add required checks: `Run Linters`, `Build Verification`, `Run Tests`
3. ✅ **Require branches to be up to date before merging**
4. ✅ **Require conversation resolution before merging**

Optionally apply similar (but less strict) rules to `develop`.

## Adding Codecov

When tests are in place:

1. Sign up at [codecov.io](https://codecov.io) and link the repository
2. Add `CODECOV_TOKEN` to the repo's **Settings → Secrets → Actions**
3. Uncomment the Codecov step in `.github/workflows/test.yml`
4. Add a coverage script to the web app, e.g.:
   ```json
   "test:coverage": "jest --coverage"
   ```

## Adding New Workflows

1. Create a new `.yml` file in `.github/workflows/`
2. Follow the existing pattern (checkout → setup Node → install → run script)
3. Add the job name to branch protection required checks if needed

## PR Template

A pull request template is provided at `.github/pull_request_template.md`. It automatically populates new PRs with a description section, change type checkboxes, and a quality checklist.
