# TODO→ISSUE GitHub Action Documentation

Welcome to the documentation for **TODO→ISSUE**, a GitHub Action that automatically converts actionable comments (TODO, FIXME, BUG, etc.) in your codebase into GitHub Issues with rich metadata and priority classification.

---

## 📦 Overview

**TODO→ISSUE** helps teams manage technical debt, bugs, and improvements directly from the codebase, ensuring nothing slips through the cracks. It scans your code for TODO-style comments and syncs them with GitHub Issues, supporting deduplication, priority classification, and automatic closing.

---

## 🚀 Quick Start

### Prerequisites

- **Issues enabled:**  
  Go to GitHub → Settings → Features → Check "Issues".
- **At least one milestone:**  
  Go to GitHub → Issues → Milestones → New milestone.

### Add the Action to Your Workflow

Create `.github/workflows/todo-issue.yml` in your repository:

```yaml
name: 'TODO→ISSUE: Automated TODO to GitHub Issue Pipeline'

on:
  push:
    branches:
      - '**'
  pull_request:
    branches:
      - '**'

jobs:
  todo_scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run TODO→ISSUE Action
        uses: TheGrowthExponent/todo-issue@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          # config_path: ".todo-issue.yml" # Optional: custom config file

      - name: Upload Action summary
        if: always()
        run: |
          echo "## TODO→ISSUE Summary" >> $GITHUB_STEP_SUMMARY
          echo "${{ steps.todo-issue.outputs.summary }}" >> $GITHUB_STEP_SUMMARY
```

---

## ⚙️ Configuration

For advanced configuration, create a `.todo-issue.yml` file in your repository root.  
See [Configuration Reference](./configuration.md) for details.

---

## 🛠 Action Outputs

- `issues_created`: Number of new issues created
- `issues_updated`: Number of existing issues updated
- `issues_closed`: Number of issues closed due to TODO removal
- `summary`: Summary of the scan and issue sync process
- `setup_error`: Error or instructions if repository is not properly configured (issues/milestones)

---

## 🛑 Troubleshooting

If the action fails and the `setup_error` output is set:
- Follow the instructions in the workflow logs or output to enable issues or create a milestone.
- Once requirements are met, re-run the workflow.

---

## 📄 Additional Documentation

- [Configuration Reference](./configuration.md)
- [Development & Release Guide](./release.md)
- [Contributing](./contributing.md)
- [FAQ](./faq.md)

---

**Made with ❤️ by The Growth Exponent**