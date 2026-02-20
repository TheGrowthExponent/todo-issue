/**
 * Shared type definitions for the TODO→ISSUE GitHub Action.
 *
 * These interfaces define the structure of TODO comments, repository context,
 * issue configuration, and metadata used throughout the action pipeline.
 */

/**
 * Represents a parsed TODO (or similar) comment found in source code.
 */
export interface Todo {
  /** Path to the file containing the TODO (relative to repo root) */
  file: string;
  /** Line number (1-based) where the TODO comment appears */
  line: number;
  /** Tag type, e.g., TODO, FIXME, BUG, etc. */
  tag: string;
  /** Optional author extracted from the comment, or null if not specified */
  author: string | null;
  /** Optional priority (P1–P4) extracted from the comment, or null if not specified */
  priority: string | null;
  /** Optional reference to an existing issue (e.g., #123), or null */
  issueRef: string | null;
  /** The main text of the TODO comment (excluding tag and metadata) */
  commentText: string;
  /** Lines of code before the TODO (for context, up to N lines) */
  contextBefore: string[];
  /** Lines of code after the TODO (for context, up to N lines) */
  contextAfter: string[];
  /** The raw line of code containing the TODO comment */
  rawLine: string;
}

/**
 * Represents a GitHub repository context.
 */
export interface Repo {
  /** Repository owner (user or org) */
  owner: string;
  /** Repository name */
  repo: string;
}

/**
 * Configuration for creating or updating a GitHub Issue.
 */
export interface IssueConfig {
  /** Labels to apply to the issue */
  labels?: string[];
  /** GitHub usernames to assign to the issue */
  assignees?: string[];
  /** Milestone number (ID) to assign */
  milestone?: number;
}

/**
 * Contextual metadata for a TODO at the time of scanning.
 */
export interface IssueContext {
  /** Branch name where the TODO was found */
  branch: string;
  /** Commit SHA (short or full) where the TODO was found */
  commit: string;
  /** Author of the commit or TODO (if available) */
  author: string;
  /** ISO timestamp when the TODO was scanned */
  timestamp: string;
}
