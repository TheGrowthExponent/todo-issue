import * as github from "@actions/github";
import { simpleGit } from "simple-git";
import { Repo } from "./types.js";

/**
 * Get the list of changed files for the current push event.
 * - On GitHub Actions: uses the event payload (push event).
 * - Fallback: uses git diff between HEAD and previous commit.
 * @param octokit - Optional, authenticated Octokit instance.
 * @returns Array of changed file paths (relative to repo root).
 */
export async function getChangedFiles(octokit: any = null): Promise<string[]> {
  // Try GitHub Actions context first
  const context = github.context;

  // Only works for push events
  if (context.eventName === "push" && context.payload) {
    const before = context.payload.before;
    const after = context.payload.after;
    const repo: Repo = context.repo;

    // If octokit is provided, use the GitHub API for accuracy (handles >300 files)
    if (octokit && before && after) {
      const changed = new Set<string>();
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
      const files = new Set<string>();
      for (const commit of context.payload.commits) {
        if (commit.added) commit.added.forEach((f: string) => files.add(f));
        if (commit.modified)
          commit.modified.forEach((f: string) => files.add(f));
        if (commit.removed) commit.removed.forEach((f: string) => files.add(f));
      }
      return Array.from(files);
    }
  }

  // Fallback: use git diff (works locally or in CI)
  const git = simpleGit();
  let diffFiles: string[] = [];
  try {
    // Get changed files between HEAD and HEAD^
    const diff = await git.diff(["--name-only", "HEAD^", "HEAD"]);
    diffFiles = diff
      .split("\n")
      .map((f: string) => f.trim())
      .filter(Boolean);
  } catch (err) {
    // If this fails (e.g., first commit), return all tracked files
    const ls = await git.raw(["ls-files"]);
    diffFiles = ls
      .split("\n")
      .map((f: string) => f.trim())
      .filter(Boolean);
  }
  return diffFiles;
}
