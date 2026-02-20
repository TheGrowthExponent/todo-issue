// todoRemover.js
// Detects removed TODOs and closes corresponding GitHub Issues

import { generateTodoKey, findExistingIssue, closeIssue } from "./issueSync.js";

/**
 * Detects which TODOs have been removed by comparing previous and current TODO lists.
 * @param {Array} previousTodos - Array of TODO objects from the previous scan (e.g., base branch)
 * @param {Array} currentTodos - Array of TODO objects from the current scan (e.g., head branch)
 * @returns {Array} - Array of TODOs that have been removed (present in previous, not in current)
 */
export function detectRemovedTodos(previousTodos, currentTodos) {
  const currentKeys = new Set(currentTodos.map(generateTodoKey));
  return previousTodos.filter(
    (todo) => !currentKeys.has(generateTodoKey(todo)),
  );
}

/**
 * Closes GitHub Issues for removed TODOs.
 * @param {object} octokit - Authenticated Octokit instance
 * @param {object} repo - { owner, repo }
 * @param {Array} removedTodos - Array of TODOs that have been removed
 * @param {object} context - { commit, author, branch }
 * @returns {Promise<number>} - Number of issues closed
 */
export async function closeIssuesForRemovedTodos(
  octokit,
  repo,
  removedTodos,
  context,
) {
  let closedCount = 0;
  for (const todo of removedTodos) {
    const key = generateTodoKey(todo);
    const existing = await findExistingIssue(octokit, repo, key);
    if (existing && existing.state === "open") {
      const closingComment = `Resolved in commit ${context.commit} by ${context.author} on branch ${context.branch}.`;
      await closeIssue(octokit, repo, existing.number, closingComment);
      closedCount++;
    }
  }
  return closedCount;
}

/**
 * Utility to get TODOs from a scan result as a map by key.
 * @param {Array} todos
 * @returns {Map<string, object>}
 */
export function todosToMapByKey(todos) {
  const map = new Map();
  for (const todo of todos) {
    map.set(generateTodoKey(todo), todo);
  }
  return map;
}
