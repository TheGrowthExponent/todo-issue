// issueSync.js
// Handles idempotent GitHub Issue creation, update, close, and reopen for TODOs

import { Todo, Repo, IssueConfig, IssueContext } from "./types.js";

/**
 * @fileoverview
 * Functions for synchronizing TODO comments with GitHub Issues:
 * - Deduplication via unique keys
 * - Creating, updating, closing, and reopening issues
 * - Rendering issue bodies with metadata and context
 * - Searching for existing issues by hidden key
 */

import * as github from "@actions/github";

/**
 * Generates a unique match key for a TODO (used for deduplication in issue body)
 * @param {Todo} todo
 * @returns {string}
 */
export function generateTodoKey(todo: Todo): string {
  // Use file path, original line, and (optionally) commit SHA for uniqueness
  // Format: todo-issue-key:<file>:<line>
  return `todo-issue-key:${todo.file}:${todo.line}`;
}

/**
 * Embeds the match key as a hidden HTML comment in the issue body
 * @param {string} key
 * @returns {string}
 */
export function renderKeyComment(key: string): string {
  return `<!-- ${key} -->`;
}

/**
 * Finds an existing open or closed issue matching the TODO key
 * @param {object} octokit - Authenticated Octokit instance
 * @param {object} repo - { owner, repo }
 * @param {string} key - Unique TODO key
 * @returns {Promise<object|null>} - Issue object or null if not found
 */
export async function findExistingIssue(
  octokit: any,
  repo: Repo,
  key: string,
): Promise<any | null> {
  // Search both open and closed issues for the hidden key comment
  const query = `repo:${repo.owner}/${repo.repo} "${key}" in:body`;
  const results = await octokit.rest.search.issuesAndPullRequests({
    q: query,
    per_page: 1,
  });
  if (results.data.items && results.data.items.length > 0) {
    return results.data.items[0];
  }
  return null;
}

/**
 * Creates a new GitHub Issue for a TODO
 * @param {object} octokit
 * @param {object} repo - { owner, repo }
 * @param {object} todo - TODO object with metadata
 * @param {object} issueConfig - config for labels, assignee, milestone, etc.
 * @param {string} body - Fully rendered issue body (with key comment)
 * @param {string} title - Issue title
 * @returns {Promise<object>} - Created issue
 */
export async function createIssue(
  octokit: any,
  repo: Repo,
  todo: Todo,
  issueConfig: IssueConfig,
  title: string,
  body: string,
): Promise<any> {
  const labels = issueConfig.labels || [];
  const assignees = issueConfig.assignees || [];
  const milestone = issueConfig.milestone || undefined;

  const resp = await octokit.rest.issues.create({
    owner: repo.owner,
    repo: repo.repo,
    title,
    body,
    labels,
    assignees,
    milestone,
  });
  return resp.data;
}

/**
 * Updates an existing GitHub Issue for a TODO (e.g., line number changed)
 * @param {object} octokit
 * @param {object} repo
 * @param {number} issue_number
 * @param {string} title
 * @param {string} body
 * @param {object} issueConfig
 * @returns {Promise<object>} - Updated issue
 */
export async function updateIssue(
  octokit: any,
  repo: Repo,
  issue_number: number,
  title: string,
  body: string,
  issueConfig: IssueConfig,
): Promise<any> {
  const labels = issueConfig.labels || [];
  const assignees = issueConfig.assignees || [];
  const milestone = issueConfig.milestone || undefined;

  const resp = await octokit.rest.issues.update({
    owner: repo.owner,
    repo: repo.repo,
    issue_number,
    title,
    body,
    labels,
    assignees,
    milestone,
  });
  return resp.data;
}

/**
 * Closes a GitHub Issue with a resolution comment
 * @param {object} octokit
 * @param {object} repo
 * @param {number} issue_number
 * @param {string} closingComment
 * @returns {Promise<void>}
 */
export async function closeIssue(
  octokit: any,
  repo: Repo,
  issue_number: number,
  closingComment: string,
): Promise<void> {
  if (closingComment) {
    await octokit.rest.issues.createComment({
      owner: repo.owner,
      repo: repo.repo,
      issue_number,
      body: closingComment,
    });
  }
  await octokit.rest.issues.update({
    owner: repo.owner,
    repo: repo.repo,
    issue_number,
    state: "closed",
  });
}

/**
 * Reopens a previously closed issue if the TODO reappears
 * @param {object} octokit
 * @param {object} repo
 * @param {number} issue_number
 * @returns {Promise<void>}
 */
export async function reopenIssue(
  octokit: any,
  repo: Repo,
  issue_number: number,
): Promise<void> {
  await octokit.rest.issues.update({
    owner: repo.owner,
    repo: repo.repo,
    issue_number,
    state: "open",
  });
}

/**
 * Renders the GitHub Issue body for a TODO, including metadata and key comment
 * @param {object} todo
 * @param {object} context - { branch, commit, author, timestamp }
 * @param {string} rationale - Priority rationale
 * @returns {string}
 */
export function renderIssueBody(
  todo: Todo,
  context: IssueContext,
  rationale: string,
): string {
  const keyComment = renderKeyComment(generateTodoKey(todo));
  const codeContext = [
    ...todo.contextBefore.map(
      (l: string, i: number) =>
        `// line ${todo.line - todo.contextBefore.length + i}: ${l}`,
    ),
    `// line ${todo.line}: ${todo.rawLine}`,
    ...todo.contextAfter.map(
      (l: string, i: number) => `// line ${todo.line + 1 + i}: ${l}`,
    ),
  ].join("\n");

  return `
## TODO Comment
> ${todo.commentText}

## Location
| Field       | Value                                      |
|-------------|--------------------------------------------|
| File        | \`${todo.file}\`                           |
| Line        | ${todo.line}                               |
| Branch      | ${context.branch}                          |
| Commit      | ${context.commit}                          |
| Introduced  | ${context.timestamp}                       |
| Author      | ${context.author}                          |

## Code Context
\`\`\`
${codeContext}
\`\`\`

## Priority Rationale
${rationale}

${keyComment}
`.trim();
}
