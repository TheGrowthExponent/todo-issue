// todoRemover.ts
// Detects removed TODOs and closes corresponding GitHub Issues

import { generateTodoKey, findExistingIssue, closeIssue } from "./issueSync.js";
import { Todo, Repo, IssueContext } from "./types.js";

/**
 * Detects which TODOs have been removed by comparing previous and current TODO lists.
 * @param previousTodos - Array of TODO objects from the previous scan (e.g., base branch)
 * @param currentTodos - Array of TODO objects from the current scan (e.g., head branch)
 * @returns Array of TODOs that have been removed (present in previous, not in current)
 */
export function detectRemovedTodos(
  previousTodos: Todo[],
  currentTodos: Todo[],
): Todo[] {
  const currentKeys = new Set(currentTodos.map(generateTodoKey));
  return previousTodos.filter(
    (todo: Todo) => !currentKeys.has(generateTodoKey(todo)),
  );
}

/**
 * Closes GitHub Issues for removed TODOs.
 * @param octokit - Authenticated Octokit instance
 * @param repo - { owner, repo }
 * @param removedTodos - Array of TODOs that have been removed
 * @param context - { commit, author, branch }
 * @returns Number of issues closed
 */
export async function closeIssuesForRemovedTodos(
  octokit: any,
  repo: Repo,
  removedTodos: Todo[],
  context: IssueContext,
): Promise<number> {
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
 * @param todos
 * @returns Map<string, Todo>
 */
export function todosToMapByKey(todos: Todo[]): Map<string, Todo> {
  const map = new Map<string, Todo>();
  for (const todo of todos) {
    map.set(generateTodoKey(todo), todo);
  }
  return map;
}
