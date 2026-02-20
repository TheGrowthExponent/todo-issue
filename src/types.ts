/**
 * Shared type definitions for the TODO→ISSUE GitHub Action
 */

export interface Todo {
  file: string;
  line: number;
  tag: string;
  author: string | null;
  priority: string | null;
  issueRef: string | null;
  commentText: string;
  contextBefore: string[];
  contextAfter: string[];
  rawLine: string;
}

export interface Repo {
  owner: string;
  repo: string;
}

export interface IssueConfig {
  labels?: string[];
  assignees?: string[];
  milestone?: string;
}

export interface IssueContext {
  branch: string;
  commit: string;
  author: string;
  timestamp: string;
}
