# FAQ — TODO→ISSUE GitHub Action

---

## What does TODO→ISSUE do?

TODO→ISSUE scans your codebase for actionable comments (TODO, FIXME, BUG, etc.) and automatically creates, updates, or closes GitHub Issues to track them. It helps teams manage technical debt, bugs, and improvements directly from the codebase.

---

## What are the prerequisites for using this action?

- **Issues must be enabled** in your repository (GitHub → Settings → Features → Issues).
- **At least one milestone** must exist (GitHub → Issues → Milestones → New milestone).

If these requirements are not met, the action will fail gracefully and provide instructions in the `setup_error` output.

---

## How do I add TODO→ISSUE to my workflow?

Create a `.github/workflows/todo-issue.yml` file in your repository. See [Quick Start](./index.md#quick-start) for a sample workflow.

---

## What comment tags does TODO→ISSUE detect?

By default: `TODO`, `FIXME`, `HACK`, `SECURITY`, `BUG`, and `XXX`.  
You can customize tags in your `.todo-issue.yml` config file.

---

## Can I customize which files are scanned?

Yes! Use the `scan.ignore` option in `.todo-issue.yml` to specify glob patterns for files or directories to exclude.

---

## How does priority classification work?

TODOs are classified as P1–P4 based on tags and keywords. You can customize label mappings and priorities in `.todo-issue.yml`.

---

## What happens when a TODO is removed from the code?

The action will automatically close the corresponding GitHub Issue if the TODO is no longer present.

---

## How does deduplication work?

Each TODO is assigned a unique hidden key based on file, line, and context. The action checks for existing issues with this key to prevent duplicates.

---

## What outputs does the action provide?

- `issues_created`: Number of new issues created
- `issues_updated`: Number of existing issues updated
- `issues_closed`: Number of issues closed due to TODO removal
- `summary`: Summary of the scan and issue sync process
- `setup_error`: Error or instructions if repository is not properly configured

---

## How do I configure advanced options?

See [Configuration Reference](./configuration.md) for details on customizing tags, ignore patterns, labels, milestones, and more.

---

## How do I troubleshoot setup errors?

If the action fails and the `setup_error` output is set:
- Follow the instructions in the workflow logs or output to enable issues or create a milestone.
- Once requirements are met, re-run the workflow.

---

## How do I release a new version or publish to GitHub Marketplace?

See [Development & Release Guide](./release.md) for instructions on tagging releases, semantic versioning, and publishing.

---

## How can I contribute or get support?

See [Contributing](./contributing.md) for guidelines.  
For support, open an issue in the repository.

---

**Made with ❤️ by The Growth Exponent**