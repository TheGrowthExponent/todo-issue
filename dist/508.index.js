export const id = 508;
export const ids = [508];
export const modules = {

/***/ 2508:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   closeIssuesForRemovedTodos: () => (/* binding */ closeIssuesForRemovedTodos),
/* harmony export */   detectRemovedTodos: () => (/* binding */ detectRemovedTodos)
/* harmony export */ });
/* unused harmony export todosToMapByKey */
/* harmony import */ var _issueSync_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(229);
// todoRemover.ts
// Detects removed TODOs and closes corresponding GitHub Issues

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
function detectRemovedTodos(previousTodos, currentTodos) {
    const currentKeys = new Set(currentTodos.map(_issueSync_js__WEBPACK_IMPORTED_MODULE_0__/* .generateTodoKey */ .$P));
    return previousTodos.filter((todo) => !currentKeys.has((0,_issueSync_js__WEBPACK_IMPORTED_MODULE_0__/* .generateTodoKey */ .$P)(todo)));
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
async function closeIssuesForRemovedTodos(octokit, repo, removedTodos, context) {
    let closedCount = 0;
    for (const todo of removedTodos) {
        const key = (0,_issueSync_js__WEBPACK_IMPORTED_MODULE_0__/* .generateTodoKey */ .$P)(todo);
        const existing = await (0,_issueSync_js__WEBPACK_IMPORTED_MODULE_0__/* .findExistingIssue */ ._l)(octokit, repo, key);
        if (existing && existing.state === 'open') {
            const closingComment = `Resolved in commit ${context.commit} by ${context.author} on branch ${context.branch}.`;
            await (0,_issueSync_js__WEBPACK_IMPORTED_MODULE_0__/* .closeIssue */ .wS)(octokit, repo, existing.number, closingComment);
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
function todosToMapByKey(todos) {
    const map = new Map();
    for (const todo of todos) {
        map.set(generateTodoKey(todo), todo);
    }
    return map;
}


/***/ })

};
