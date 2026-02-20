// TODO→ISSUE GitHub Action Entrypoint
// -----------------------------------
// Main pipeline: config → changed files → scan TODOs → classify → sync issues

import core from "@actions/core";
import github from "@actions/github";
import simpleGit from "simple-git";
import { loadConfig } from "./config.js";
import { getChangedFiles } from "./changedFiles.js";
import { scanFilesForTodos } from "./todoScanner.js";
import { classifyPriority } from "./priorityClassifier.js";
import {
  generateTodoKey,
  renderIssueBody,
  findExistingIssue,
  createIssue,
  updateIssue,
  closeIssue,
  reopenIssue,
} from "./issueSync.js";

async function run() {
  try {
    core.startGroup("TODO→ISSUE Action: Initialization");

    // Load inputs
    const githubToken = core.getInput("github_token", { required: true });
    const configPath = core.getInput("config_path") || ".todo-issue.yml";

    // Set up GitHub and Git clients
    const octokit = github.getOctokit(githubToken);
    const git = simpleGit();

    // Load config (with defaults)
    const config = loadConfig(configPath);
    core.info(`Loaded config from ${configPath}`);

    // Detect changed files (diff-only or full scan)
    let filesToScan = [];
    if (config.scan.diff_only) {
      filesToScan = await getChangedFiles(octokit);
      core.info(
        `Scanning changed files only (${filesToScan.length}): ${filesToScan.join(", ")}`,
      );
    } else {
      // Full repo scan: get all tracked files
      const ls = await git.lsFiles();
      filesToScan = ls
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);
      core.info(`Scanning all tracked files (${filesToScan.length})`);
    }

    // Filter ignored paths
    const micromatch = (await import("micromatch")).default;
    filesToScan = filesToScan.filter(
      (f) => !micromatch.isMatch(f, config.scan.ignore || []),
    );

    // Scan files for TODOs (current state)
    const todos = scanFilesForTodos(filesToScan, {
      tags: config.scan.tags,
      contextLines: config.scan.context_lines,
    });

    core.info(`Found ${todos.length} TODO(s) in scanned files.`);

    // Prepare repo context
    const repo = github.context.repo;
    const branch =
      github.context.ref?.split("/").slice(2).join("/") || "unknown";
    const commit = github.context.sha?.slice(0, 7) || "unknown";
    const timestamp = new Date().toISOString(); // Could use git log/blame for more accuracy

    // Track stats
    let issuesCreated = 0;
    let issuesUpdated = 0;
    let issuesClosed = 0;

    // --- Detect removed TODOs and close corresponding issues ---
    // Only possible if diff_only is true and we can get the base commit
    let removedTodos = [];
    if (
      config.scan.diff_only &&
      github.context.payload &&
      github.context.payload.before
    ) {
      try {
        // Checkout base commit to a temp location and scan for previous TODOs
        const baseCommit = github.context.payload.before;
        await git.raw(["checkout", baseCommit]);
        const baseFiles = filesToScan; // Use same file list for base scan
        const previousTodos = scanFilesForTodos(baseFiles, {
          tags: config.scan.tags,
          contextLines: config.scan.context_lines,
        });
        // Restore HEAD
        await git.raw(["checkout", github.context.sha]);
        // Compare previous and current TODOs
        const { detectRemovedTodos, closeIssuesForRemovedTodos } =
          await import("./todoRemover.js");
        removedTodos = detectRemovedTodos(previousTodos, todos);
        if (removedTodos.length > 0) {
          issuesClosed = await closeIssuesForRemovedTodos(
            octokit,
            repo,
            removedTodos,
            { commit, author: "unknown", branch },
          );
          core.info(`Closed ${issuesClosed} issue(s) for removed TODOs.`);
        }
      } catch (err) {
        core.warning(`Failed to detect/close removed TODOs: ${err.message}`);
      }
    }

    // Process each TODO
    for (const todo of todos) {
      // Classify priority
      const { priority, rationale } = classifyPriority(todo);

      // Compose issue config (labels, assignee, milestone)
      const issueLabels = (
        config.issues.labels?.[priority.toLowerCase()] || []
      ).concat(["auto-generated"]);
      const assignees =
        config.issues.assignee_strategy === "owner"
          ? [repo.owner]
          : config.issues.assignee_strategy === "author" && todo.author
            ? [todo.author]
            : [];
      const milestone = config.issues.milestone || undefined;

      // Compose issue title
      const title = `[${todo.tag}][${priority}] ${todo.file}:${todo.line} — ${todo.commentText.slice(0, 60)}`;

      // Compose issue body
      const issueBody = renderIssueBody(
        todo,
        {
          branch,
          commit,
          author: todo.author || "unknown",
          timestamp,
        },
        rationale,
      );

      // Deduplication key
      const key = generateTodoKey(todo);

      // Find existing issue (open or closed)
      const existing = await findExistingIssue(octokit, repo, key);

      if (!existing) {
        // Create new issue
        await createIssue(
          octokit,
          repo,
          todo,
          { labels: issueLabels, assignees, milestone },
          title,
          issueBody,
        );
        issuesCreated++;
        core.info(`Created issue for TODO: ${title}`);
      } else if (existing.state === "closed") {
        // Reopen if TODO reappeared
        await reopenIssue(octokit, repo, existing.number);
        await updateIssue(octokit, repo, existing.number, title, issueBody, {
          labels: issueLabels,
          assignees,
          milestone,
        });
        issuesUpdated++;
        core.info(`Reopened and updated issue for TODO: ${title}`);
      } else {
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

    // Output summary
    const summary = [
      `Scanned ${filesToScan.length} files.`,
      `Found ${todos.length} TODO(s).`,
      `Created ${issuesCreated} issue(s).`,
      `Updated ${issuesUpdated} issue(s).`,
      `Closed ${issuesClosed} issue(s).`,
    ].join(" ");

    core.setOutput("issues_created", issuesCreated);
    core.setOutput("issues_updated", issuesUpdated);
    core.setOutput("issues_closed", issuesClosed);
    core.setOutput("summary", summary);

    core.endGroup();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
