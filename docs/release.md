# Development & Release Guide

Welcome to the development and release guide for **TODO→ISSUE**. This document covers best practices for contributing, building, tagging, and publishing the GitHub Action.

---

## 🛠️ Development Workflow

### 1. Clone the Repository

```sh
git clone https://github.com/TheGrowthExponent/todo-issue.git
cd todo-issue
```

### 2. Install Dependencies

```sh
pnpm install
```

### 3. Build the Action

```sh
pnpm build
```

### 4. Run Tests

```sh
pnpm test
```

- Functional tests are located in `tests/functional.test.js`.
- Ensure all tests pass before submitting changes.

---

## 🚀 Tagging a Release (Semantic Versioning)

Use [semantic versioning](https://semver.org/) for release tags:

- **Major:** Breaking changes (`v2.0.0`)
- **Minor:** New features, backward compatible (`v1.1.0`)
- **Patch:** Bug fixes, backward compatible (`v1.0.1`)

### How to Tag and Push a Release

```sh
git checkout main
pnpm build
git add -f dist/
git commit -m "Build for release v1.0.0"
git tag v1.0.0
git push origin v1.0.0
```

> **Note:** The release workflow (`.github/workflows/release.yml`) will build and commit the action when a tag is pushed.

---

## 🏪 Publishing to GitHub Marketplace

1. Go to your repository on GitHub.
2. Click the **Actions** tab.
3. Find your action and click **Publish to Marketplace**.
4. Fill out listing details:
   - Title, description, branding (icon/color), categories.
   - Usage instructions (copy from README).
   - Choose the release/tag to publish (e.g., `v1.0.0`).
5. Submit for review.

After approval, your action will be available for others to use via the [GitHub Marketplace](https://github.com/marketplace/actions).

---

## 🧑‍💻 Contributing

1. Fork the repo and create a new branch.
2. Make your changes with clear inline documentation.
3. Add or update tests as needed.
4. Open a pull request with a clear description.

Please follow the existing code style and add JSDoc/TSDoc comments for new or modified code.

---

## 📝 License

This project is licensed under the [MIT License](../LICENSE).

---

**Made with ❤️ by The Growth Exponent**
