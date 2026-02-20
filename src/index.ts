/**
 * TODO→ISSUE GitHub Action Entrypoint
 * -----------------------------------
 * Main pipeline: config → changed files → scan TODOs → classify → sync issues
 *
 * This is the main entry point for the GitHub Action. It loads configuration,
 * detects changed files (or all files), scans for TODO/FIXME/HACK/SECURITY/BUG/XXX
 * comments, classifies their priority, and synchronizes them with GitHub Issues.
 *
 * Features:
 * - Supports diff-only or full-repo scan
 * - Ignores files based on config
 * - Classifies TODOs by tag and keywords
 * - Deduplicates issues using a hidden key
 * - Updates, closes, or reopens issues as needed
 * - Outputs summary statistics for the workflow
 */

import * as core from '@actions/core';
import * as github from '@actions/github';
import { simpleGit } from 'simple-git';
import { loadConfig } from './config.js';
import { getChangedFiles } from './changedFiles.js';
import { scanFilesForTodos } from './todoScanner.js';
import { classifyPriority } from './priorityClassifier.js';
import {
  generateTodoKey,
  renderIssueBody,
  findExistingIssue,
  createIssue,
  updateIssue,
  reopenIssue,
} from './issueSync.js';

/**
 * Main runner for the TODO→ISSUE GitHub Action.
 * Loads configuration, detects files to scan, extracts TODOs, classifies them,
 * and synchronizes with GitHub Issues (create, update, close, reopen).
 *
 * Outputs summary statistics for use in workflow steps.
 */
async function run() {
  try {
    core.startGroup('TODO→ISSUE Action: Initialization');

    // === 1. Load Action Inputs ===
    /**
     * github_token: Required. Used for GitHub API authentication.
     * config_path: Optional. Path to .todo-issue.yml config file.
     */
    const githubToken = core.getInput('github_token', { required: true });
    const configPath = core.getInput('config_path') || '.todo-issue.yml';

    // === 2. Set up GitHub and Git clients ===
    const octokit = github.getOctokit(githubToken);
    const git = simpleGit();

    // === Pre-check: Issues enabled & milestone exists ===
    const { owner, repo: repoName } = github.context.repo;

    // Check if issues are enabled
    const repoInfo = await octokit.rest.repos.get({ owner, repo: repoName });
    if (!repoInfo.data.has_issues) {
      const msg = `❌ Issues are not enabled for this repository.\nTo enable issues: Go to GitHub → Settings → Features → Check 'Issues'.`;
      core.setOutput('setup_error', msg);
      core.setFailed(msg);
      return;
    }

    // Check if milestones exist
    const milestones = await octokit.rest.issues.listMilestones({ owner, repo: repoName });
    if (!milestones.data || milestones.data.length === 0) {
      const msg = `❌ No milestones found in this repository.\nTo create a milestone: Go to GitHub → Issues → Milestones → New milestone.`;
      core.setOutput('setup_error', msg);
      core.setFailed(msg);
      return;
    }

    // === 3. Load configuration (with defaults) ===
    const config = loadConfig(configPath);
    core.info(`Loaded config from ${configPath}`);

    // === 4. Detect files to scan ===
    // If diff_only, only scan changed files; otherwise, scan all tracked files.
    let filesToScan: string[] = [];
    if (config.scan.diff_only) {
      filesToScan = await getChangedFiles(octokit);
      core.info(`Scanning changed files only (${filesToScan.length}): ${filesToScan.join(', ')}`);
    } else {
      // Full repo scan: get all tracked files
      const ls = await git.raw(['ls-files']);
      filesToScan = ls
        .split('\n')
        .map((f: string) => f.trim())
        .filter(Boolean);
      core.info(`Scanning all tracked files (${filesToScan.length})`);
    }

    // === 5. Filter ignored paths ===
    // Uses micromatch patterns from config.scan.ignore
    const micromatch = (await import('micromatch')).default;
    filesToScan = filesToScan.filter(
      (f: string) => !micromatch.isMatch(f, config.scan.ignore || [])
    );

    // === 6. Scan files for TODOs ===
    // Extracts TODO/FIXME/HACK/SECURITY/BUG/XXX comments with metadata.
    const todos = scanFilesForTodos(filesToScan, {
      tags: config.scan.tags,
      contextLines: config.scan.context_lines,
    });

    core.info(`Found ${todos.length} TODO(s) in scanned files.`);

    // === 7. Prepare repository context for issue metadata ===
    const repo = github.context.repo;
    const branch = github.context.ref?.split('/').slice(2).join('/') || 'unknown';
    const commit = github.context.sha?.slice(0, 7) || 'unknown';
    const timestamp = new Date().toISOString(); // Could use git log/blame for more accuracy

    // === 8. Initialize statistics counters ===
    let issuesCreated = 0;
    let issuesUpdated = 0;
    let issuesClosed = 0;

    // === 9. Detect removed TODOs and close corresponding issues ===
    // Only possible if diff_only is true and we can get the base commit
    let removedTodos = [];
    if (config.scan.diff_only && github.context.payload && github.context.payload.before) {
      try {
        // Checkout base commit to a temp location and scan for previous TODOs
        const baseCommit = github.context.payload.before;
        await git.raw(['checkout', baseCommit]);
        const baseFiles = filesToScan; // Use same file list for base scan
        const previousTodos = scanFilesForTodos(baseFiles, {
          tags: config.scan.tags,
          contextLines: config.scan.context_lines,
        });
        // Restore HEAD
        await git.raw(['checkout', github.context.sha]);
        // Compare previous and current TODOs
        const { detectRemovedTodos, closeIssuesForRemovedTodos } = await import('./todoRemover.js');
        removedTodos = detectRemovedTodos(previousTodos, todos);
        if (removedTodos.length > 0) {
          issuesClosed = await closeIssuesForRemovedTodos(octokit, repo, removedTodos, {
            commit,
            author: 'unknown',
            branch,
            timestamp,
          });
          core.info(`Closed ${issuesClosed} issue(s) for removed TODOs.`);
        }
      } catch (err) {
        if (err instanceof Error) {
          core.warning(`Failed to detect/close removed TODOs: ${err.message}`);
        } else {
          core.warning('Failed to detect/close removed TODOs: Unknown error');
        }
      }
    }

    // === 10. Process each TODO: classify, deduplicate, and sync with GitHub Issues ===
    for (const todo of todos) {
      // Classify priority (P1–P4) and rationale
      const { priority, rationale } = classifyPriority(todo);

      // Compose issue config (labels, assignee, milestone)
      const issueLabels = (
        (config.issues.labels as Record<string, string[]>)[priority.toLowerCase()] || []
      ).concat(['auto-generated']);
      const assignees =
        config.issues.assignee_strategy === 'owner'
          ? [repo.owner]
          : config.issues.assignee_strategy === 'author' && todo.author
            ? [todo.author]
            : [];
      const milestone = config.issues.milestone || undefined;

      // Compose issue title
      const title = `[${todo.tag}][${priority}] ${todo.file}:${todo.line} — ${todo.commentText.slice(0, 60)}`;

      // Compose issue body (includes metadata, code context, rationale, and deduplication key)
      const issueBody = renderIssueBody(
        todo,
        {
          branch,
          commit,
          author: todo.author || 'unknown',
          timestamp,
        },
        rationale
      );

      // Deduplication key (hidden in issue body)
      const key = generateTodoKey(todo);

      // Find existing issue (open or closed) by deduplication key
      const existing = await findExistingIssue(octokit, repo, key);

      if (!existing) {
        // Create new issue
        await createIssue(
          octokit,
          repo,
          todo,
          { labels: issueLabels, assignees, milestone },
          title,
          issueBody
        );
        issuesCreated++;
        core.info(`Created issue for TODO: ${title}`);
      } else if (typeof existing === 'object' && existing !== null && existing.state === 'closed') {
        // Reopen if TODO reappeared
        await reopenIssue(octokit, repo, existing.number);
        await updateIssue(octokit, repo, existing.number, title, issueBody, {
          labels: issueLabels,
          assignees,
          milestone,
        });
        issuesUpdated++;
        core.info(`Reopened and updated issue for TODO: ${title}`);
      } else if (typeof existing === 'object' && existing !== null && 'number' in existing) {
        // Update if line number or context changed
        await updateIssue(octokit, repo, existing.number, title, issueBody, {
          labels: issueLabels,
          assignees,
          milestone,
        });
        issuesUpdated++;
        core.info(`Updated issue for TODO: ${title}`);
      }
    }

    // === 11. Output summary statistics for workflow consumption ===
    const summary = [
      `Scanned ${filesToScan.length} files.`,
      `Found ${todos.length} TODO(s).`,
      `Created ${issuesCreated} issue(s).`,
      `Updated ${issuesUpdated} issue(s).`,
      `Closed ${issuesClosed} issue(s).`,
    ].join(' ');

    core.setOutput('issues_created', issuesCreated);
    core.setOutput('issues_updated', issuesUpdated);
    core.setOutput('issues_closed', issuesClosed);
    core.setOutput('summary', summary);

    core.endGroup();
  } catch (error) {
    // Fail the workflow if any error occurs
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('Unknown error');
    }
  }
}

// Run the action
void run();
