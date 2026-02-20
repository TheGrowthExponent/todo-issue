import { Todo, Repo, IssueConfig, IssueContext } from './types.js';
export declare function generateTodoKey(todo: Todo): string;
/**
 * Embeds the match key as a hidden HTML comment in the issue body
 * @param {string} key
 * @returns {string}
 */
export declare function renderKeyComment(key: string): string;
/**
 * Finds an existing open or closed issue matching the TODO key
 * @param {object} octokit - Authenticated Octokit instance
 * @param {object} repo - { owner, repo }
 * @param {string} key - Unique TODO key
 * @returns {Promise<object|null>} - Issue object or null if not found
 */
export declare function findExistingIssue(octokit: any, repo: Repo, key: string): Promise<{
    number: number;
    state?: string;
} | null>;
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
export declare function createIssue(octokit: any, repo: Repo, todo: Todo, issueConfig: IssueConfig, title: string, body: string): Promise<{
    number: number;
}>;
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
export declare function updateIssue(octokit: any, repo: Repo, issue_number: number, title: string, body: string, issueConfig: IssueConfig): Promise<{
    number: number;
}>;
/**
 * Closes a GitHub Issue with a resolution comment
 * @param {object} octokit
 * @param {object} repo
 * @param {number} issue_number
 * @param {string} closingComment
 * @returns {Promise<void>}
 */
export declare function closeIssue(octokit: any, repo: Repo, issue_number: number, closingComment: string): Promise<void>;
/**
 * Reopens a previously closed issue if the TODO reappears
 * @param {object} octokit
 * @param {object} repo
 * @param {number} issue_number
 * @returns {Promise<void>}
 */
export declare function reopenIssue(octokit: any, repo: Repo, issue_number: number): Promise<void>;
/**
 * Renders the GitHub Issue body for a TODO, including metadata and key comment
 * @param {object} todo
 * @param {object} context - { branch, commit, author, timestamp }
 * @param {string} rationale - Priority rationale
 * @returns {string}
 */
export declare function renderIssueBody(todo: Todo, context: IssueContext, rationale: string): string;
