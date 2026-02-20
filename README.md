# TODO→ISSUE GitHub Action

Automatically convert TODO, FIXME, HACK, SECURITY, BUG, and XXX comments in your codebase into GitHub Issues—with rich metadata, deduplication, and priority classification.

---

## 🚀 Quick Start

### Prerequisites

- **Issues enabled:**  
  Go to GitHub → Settings → Features → Check "Issues".
- **At least one milestone:**  
  Go to GitHub → Issues → Milestones → New milestone.

If these requirements are not met, the action will fail gracefully and provide instructions in the `setup_error` output.

---

### Add to Your Workflow

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

### Action Outputs

- `issues_created`: Number of new issues created
- `issues_updated`: Number of existing issues updated
- `issues_closed`: Number of issues closed due to TODO removal
- `summary`: Summary of the scan and issue sync process
- `setup_error`: Error or instructions if repository is not properly configured (issues/milestones)

---

## 📚 Documentation

For advanced configuration, troubleshooting, and developer instructions, visit [the GitHub Pages documentation](https://thegrowthexponent.github.io/todo-issue/).

---
