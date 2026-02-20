# TODO→ISSUE

[![Test Status](https://github.com/TheGrowthExponent/todo-issue/actions/workflows/todo-issue.yml/badge.svg)](https://github.com/TheGrowthExponent/todo-issue/actions/workflows/todo-issue.yml)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/thegrowthexponent)
[![Donate via PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg?logo=paypal)](https://www.paypal.com/donate/?hosted_button_id=3D3EH5AXHUKEJ)

Automatically convert TODO, FIXME, HACK, SECURITY, BUG, and XXX comments in your codebase into GitHub Issues—with rich metadata, deduplication, and priority classification.

---

## 🚀 Project Purpose

**TODO→ISSUE** is a GitHub Action that scans your code for actionable comments (like `TODO`, `FIXME`, `BUG`, etc.) and automatically creates, updates, or closes GitHub Issues to track them. This helps teams manage technical debt, bugs, and improvements directly from the codebase, ensuring nothing slips through the cracks.

---

## ✨ Features

- **Automatic Issue Creation:** Converts TODO-style comments into GitHub Issues.
- **Priority Classification:** Assigns priorities (P1–P4) based on tags and keywords.
- **Rich Metadata:** Issues include file, line, author, code context, and rationale.
- **Deduplication:** Prevents duplicate issues for the same TODO.
- **Automatic Closing:** Closes issues when TODOs are removed from code.
- **Customizable:** Supports custom tags, ignore patterns, labels, and more via config.
- **Diff-Only or Full Scan:** Scan only changed files or the entire repo.
- **Works with Any Language:** Detects TODOs in any text-based source code.

---

## ⚡️ Quick Start

### 1. Add the Action to Your Workflow

Create (or update) `.github/workflows/todo-issue.yml` in your repository:

```yaml
name: "TODO→ISSUE: Automated TODO to GitHub Issue Pipeline"

on:
  push:
    branches:
      - "**"

jobs:
  todo_scan:
    name: "Scan for TODOs and create GitHub Issues"
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Build Action
        run: pnpm build

      - name: Run TODO→ISSUE Action
        uses: TheGrowthExponent/todo-issue@main
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          # config_path: ".todo-issue.yml" # Optional: custom config file

      - name: Upload Action summary
        if: always()
        run: |
          echo "## TODO→ISSUE Summary" >> $GITHUB_STEP_SUMMARY
          echo "${{ steps.todo-issue.outputs.summary }}" >> $GITHUB_STEP_SUMMARY
```

### 2. (Optional) Customize with `.todo-issue.yml`

Place a `.todo-issue.yml` in your repo root to override defaults:

```yaml
scan:
  tags: ["TODO", "FIXME", "BUG"]
  ignore: ["node_modules/", "dist/", "**/*.min.js"]
  context_lines: 3
  diff_only: true

issues:
  assignee_strategy: "owner" # or "author" or "none"
  milestone: "backlog"
  labels:
    p1: ["priority:critical", "security"]
    p2: ["priority:high", "bug"]
    p3: ["priority:medium", "tech-debt"]
    p4: ["priority:low", "enhancement"]
  require_owner_tag: false

blocking:
  fail_on_p1: true
  fail_on_p2: false
```

---

## ⚙️ Configuration Reference

### Action Inputs (`action.yml`)

- `github_token` (**required**): GitHub token for authentication (use `${{ secrets.GITHUB_TOKEN }}`).
- `config_path` (optional): Path to your `.todo-issue.yml` config file (default: `.todo-issue.yml`).

### Config File (`.todo-issue.yml`)

- **scan.tags**: List of comment tags to detect (default: TODO, FIXME, HACK, SECURITY, BUG, XXX).
- **scan.ignore**: Glob patterns for files/directories to ignore.
- **scan.context_lines**: Number of lines before/after TODO for code context.
- **scan.diff_only**: If true, only scan changed files; otherwise, scan all tracked files.
- **issues.assignee_strategy**: "owner", "author", or "none" for issue assignment.
- **issues.milestone**: Milestone to assign to created issues.
- **issues.labels**: Labels to apply by priority (p1–p4).
- **issues.require_owner_tag**: If true, require an owner tag in TODOs.
- **blocking.fail_on_p1**: If true, fail the workflow if a P1 TODO is found.
- **blocking.fail_on_p2**: If true, fail the workflow if a P2 TODO is found.

---

## 🔄 How It Works (Pipeline Summary)

1. **Load Config:** Reads `.todo-issue.yml` or uses defaults.
2. **Detect Files:** Scans changed files (diff-only) or all tracked files.
3. **Scan for TODOs:** Finds actionable comments and extracts metadata.
4. **Classify Priority:** Assigns P1–P4 based on tag and keywords.
5. **Deduplicate:** Checks for existing issues using a hidden key.
6. **Sync Issues:** Creates, updates, reopens, or closes GitHub Issues as needed.
7. **Output Summary:** Reports stats and results to workflow summary.

---

## 🧪 Testing

This project uses [Vitest](https://vitest.dev/) for functional and unit testing.

### Run Tests Locally

```sh
pnpm install
pnpm run test
```

- Functional tests are in `tests/functional.test.js`.
- Tests cover scanning, classification, deduplication, and issue rendering.
- Test results are reported via the badge at the top of this README.

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repo and create a new branch.
2. Make your changes with clear inline documentation.
3. Add or update tests as needed.
4. Open a pull request with a clear description.

Please follow the existing code style and add JSDoc/TSDoc comments for new or modified code.

### Issue Template

When submitting an issue, please include:
- A clear description of the problem or feature request.
- Steps to reproduce (if applicable).
- Example code or workflow YAML (if relevant).
- Environment details (OS, Node version, etc.).

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

**Made with ❤️ by The Growth Exponent**