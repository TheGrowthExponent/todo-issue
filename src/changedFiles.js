todo-issue/src/changedFiles.js
// changedFiles.js
// Utility to detect changed files for the current push event in a GitHub Action context.
// Falls back to git diff if not running in Actions or event data is missing.

import github from '@actions/github';
import simpleGit from 'simple-git';

/**
 * Get the list of changed files for the current push event.
 * - On GitHub Actions: uses the event payload (push event).
 * - Fallback: uses git diff between HEAD and previous commit.
 * @param {object} [octokit] - Optional, authenticated Octokit instance.
 * @returns {Promise<string[]>} - Array of changed file paths (relative to repo root).
 */
export async function getChangedFiles(octokit = null) {
  // Try GitHub Actions context first
  const context = github.context;

  // Only works for push events
  if (context.eventName === 'push' && context.payload) {
    const before = context.payload.before;
    const after = context.payload.after;
    const repo = context.repo;

    // If octokit is provided, use the GitHub API for accuracy (handles >300 files)
    if (octokit && before && after) {
      const changed = new Set();
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const resp = await octokit.rest.repos.compareCommitsWithBasehead({
          owner: repo.owner,
          repo: repo.repo,
          basehead: `${before}...${after}`,
          per_page: 100,
          page,
        });
        if (resp.data && resp.data.files) {
          for (const file of resp.data.files) {
            if (file.filename) changed.add(file.filename);
          }
          hasMore = resp.data.files.length === 100;
          page += 1;
        } else {
          hasMore = false;
        }
      }
      return Array.from(changed);
    }

    // Fallback: try to get changed files from payload (may be truncated)
    if (context.payload.commits && Array.isArray(context.payload.commits)) {
      const files = new Set();
      for (const commit of context.payload.commits) {
        if (commit.added) commit.added.forEach(f => files.add(f));
        if (commit.modified) commit.modified.forEach(f => files.add(f));
        if (commit.removed) commit.removed.forEach(f => files.add(f));
      }
      return Array.from(files);
    }
  }

  // Fallback: use git diff (works locally or in CI)
  const git = simpleGit();
  let diffFiles = [];
  try {
    // Get changed files between HEAD and HEAD^
    const diff = await git.diff(['--name-only', 'HEAD^', 'HEAD']);
    diffFiles = diff
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);
  } catch (err) {
    // If this fails (e.g., first commit), return all tracked files
    const ls = await git.lsFiles();
    diffFiles = ls
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);
  }
  return diffFiles;
}
