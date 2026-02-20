# TODO→ISSUE Action Configuration Reference

This page describes how to customize the behavior of the TODO→ISSUE GitHub Action using a `.todo-issue.yml` configuration file in your repository root.

---

## 📄 Configuration File: `.todo-issue.yml`

Place a `.todo-issue.yml` file in your repository root to override defaults and fine-tune how TODOs are detected, classified, and synced with GitHub Issues.

### Example Configuration

```yaml
scan:
  tags: ['TODO', 'FIXME', 'BUG']
  ignore: ['node_modules/', 'dist/', '**/*.min.js']
  context_lines: 3
  diff_only: true

issues:
  assignee_strategy: 'owner' # or "author" or "none"
  milestone: 'backlog'
  labels:
    p1: ['priority:critical', 'security']
    p2: ['priority:high', 'bug']
    p3: ['priority:medium', 'tech-debt']
    p4: ['priority:low', 'enhancement']
  require_owner_tag: false

blocking:
  fail_on_p1: true
  fail_on_p2: false
```

---

## 🔍 Configuration Options

### `scan` Section

- **tags**:  
  List of comment tags to detect.  
  _Default_: `['TODO', 'FIXME', 'HACK', 'SECURITY', 'BUG', 'XXX']`

- **ignore**:  
  Glob patterns for files/directories to ignore during scanning.  
  _Example_: `['node_modules/', 'dist/', '**/*.min.js']`

- **context_lines**:  
  Number of lines before/after TODO for code context in issue body.  
  _Default_: `3`

- **diff_only**:  
  If `true`, only scan changed files; otherwise, scan all tracked files.  
  _Default_: `true`

---

### `issues` Section

- **assignee_strategy**:  
  Who to assign created issues to.  
  - `"owner"`: Assigns to repo owner  
  - `"author"`: Assigns to TODO author (if detected)  
  - `"none"`: No assignee  
  _Default_: `"owner"`

- **milestone**:  
  Milestone to assign to created issues.  
  _Example_: `'backlog'`  
  _Note_: Must match an existing milestone name.

- **labels**:  
  Labels to apply by priority (p1–p4).  
  _Example_:  
  ```yaml
  labels:
    p1: ['priority:critical', 'security']
    p2: ['priority:high', 'bug']
    p3: ['priority:medium', 'tech-debt']
    p4: ['priority:low', 'enhancement']
  ```

- **require_owner_tag**:  
  If `true`, require an owner tag in TODOs (e.g., `TODO(owner): ...`).  
  _Default_: `false`

---

### `blocking` Section

- **fail_on_p1**:  
  If `true`, fail the workflow if a P1 TODO is found.

- **fail_on_p2**:  
  If `true`, fail the workflow if a P2 TODO is found.

---

## 📝 Tips

- Use glob patterns in `ignore` to exclude files and directories from scanning.
- Customize `labels` to match your team's workflow and priorities.
- Set `diff_only` to `false` for full repository scans (may be slower).
- Ensure your milestone name matches an existing milestone in your repository.

---

## 🛠️ Advanced

- The action supports any text-based source code.
- You can combine multiple tags, labels, and ignore patterns for granular control.
- For more advanced usage, see [Development & Release Guide](./release.md).

---

## ❓ FAQ

See [FAQ](./faq.md) for common questions and troubleshooting.

---

**Made with ❤️ by The Growth Exponent**