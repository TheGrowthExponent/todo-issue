# Contributing to TODO→ISSUE

Thank you for your interest in contributing to **TODO→ISSUE**! We welcome contributions of all kinds—bug reports, feature requests, code improvements, documentation, and more.

---

## 📝 How to Contribute

### 1. Fork the Repository

- Click the "Fork" button at the top right of the repository page to create your own copy.

### 2. Clone Your Fork

```sh
git clone https://github.com/<your-username>/todo-issue.git
cd todo-issue
```

### 3. Create a Branch

- Use a descriptive branch name for your changes.

```sh
git checkout -b feature/my-new-feature
```

### 4. Make Your Changes

- Add or update code, tests, or documentation as needed.
- Please follow the existing code style and add JSDoc/TSDoc comments for new or modified code.
- For code changes, ensure you run and pass all tests:

```sh
pnpm install
pnpm run test
```

### 5. Commit and Push

```sh
git add .
git commit -m "Describe your changes"
git push origin feature/my-new-feature
```

### 6. Open a Pull Request

- Go to your fork on GitHub and click "Compare & pull request".
- Provide a clear description of your changes and reference any related issues.

---

## 🧪 Testing

- This project uses [Vitest](https://vitest.dev/) for functional and unit testing.
- Functional tests are in `tests/functional.test.js`.
- Please add or update tests for any new features or bug fixes.

---

## 🗂️ Issue Reporting

When submitting an issue, please include:

- A clear description of the problem or feature request.
- Steps to reproduce (if applicable).
- Example code or workflow YAML (if relevant).
- Environment details (OS, Node version, etc.).

---

## 💡 Code Style

- Use TypeScript for source files.
- Follow existing formatting and naming conventions.
- Use `pnpm lint` and `pnpm format` if available.

---

## 🤝 Community Guidelines

- Be respectful and constructive in all interactions.
- Review existing issues and pull requests before submitting new ones.
- Provide context and rationale for your changes.

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](../LICENSE).

---

**Thank you for helping make TODO→ISSUE better!**