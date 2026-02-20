// todoRemover.ts
// Detects removed TODOs and closes corresponding GitHub Issues
import { generateTodoKey, findExistingIssue, closeIssue } from './issueSync.js';

/**
 * @fileoverview
 * Utilities for detecting removed TODO comments in code and closing their corresponding GitHub Issues.
 * Used as part of the TODO→ISSUE GitHub Action pipeline to ensure issues are closed when TODOs are deleted from code.
 */

import { Todo, Repo, IssueContext } from './types.js';

/**
 * Detects which TODOs have been removed by comparing previous and current TODO lists.
 *
 * @param {Todo[]} previousTodos - Array of TODO objects from the previous scan (e.g., base branch).
 * @param {Todo[]} currentTodos - Array of TODO objects from the current scan (e.g., head branch).
 * @returns {Todo[]} Array of TODOs that have been removed (present in previous, not in current).
 *
 * @example
 *   const removed = detectRemovedTodos(oldTodos, newTodos);
 */
export function detectRemovedTodos(previousTodos: Todo[], currentTodos: Todo[]): Todo[] {
  const currentKeys = new Set(currentTodos.map(generateTodoKey));
  return previousTodos.filter((todo: Todo) => !currentKeys.has(generateTodoKey(todo)));
}

/**
 * Closes GitHub Issues for TODOs that have been removed from the codebase.
 *
 * @param {any} octokit - Authenticated Octokit instance for GitHub API calls.
 * @param {Repo} repo - Repository context ({ owner, repo }).
 * @param {Todo[]} removedTodos - Array of TODOs that have been removed.
 * @param {IssueContext} context - Context for the removal (commit, author, branch, timestamp).
 * @returns {Promise<number>} Number of issues closed.
 *
 * @example
 *   const closed = await closeIssuesForRemovedTodos(octokit, repo, removedTodos, context);
 */
export async function closeIssuesForRemovedTodos(
  octokit: any,
  repo: Repo,
  removedTodos: Todo[],
  context: IssueContext
): Promise<number> {
  let closedCount = 0;
  for (const todo of removedTodos) {
    const key = generateTodoKey(todo);
    const existing = await findExistingIssue(octokit, repo, key);
    if (existing && existing.state === 'open') {
      const closingComment = `Resolved in commit ${context.commit} by ${context.author} on branch ${context.branch}.`;
      await closeIssue(octokit, repo, existing.number, closingComment);
      closedCount++;
    }
  }
  return closedCount;
}

/**
 * Utility to get TODOs from a scan result as a map by deduplication key.
 *
 * @param {Todo[]} todos - Array of TODO objects.
 * @returns {Map<string, Todo>} Map from deduplication key to TODO object.
 *
 * @example
 *   const todoMap = todosToMapByKey(todos);
 */
export function todosToMapByKey(todos: Todo[]): Map<string, Todo> {
  const map = new Map<string, Todo>();
  for (const todo of todos) {
    map.set(generateTodoKey(todo), todo);
  }
  return map;
}
