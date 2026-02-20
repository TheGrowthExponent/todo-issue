/**
 * Functional tests for TODO→ISSUE core pipeline
 * Uses Jest for test runner.
 * These tests mock file system and GitHub API interactions to verify end-to-end logic.
 */

import fs from "fs";
import path from "path";
import { scanFilesForTodos } from "../src/todoScanner.js";
import { classifyPriority } from "../src/priorityClassifier.js";
import { generateTodoKey, renderIssueBody } from "../src/issueSync.js";

// Mock data directory
const MOCK_DIR = path.join(process.cwd(), "tests", "mockdata");

describe("TODO→ISSUE Functional Pipeline", () => {
  beforeAll(() => {
    // Ensure mockdata directory exists
    if (!fs.existsSync(MOCK_DIR)) {
      fs.mkdirSync(MOCK_DIR, { recursive: true });
    }
    // Write a sample file with various TODOs
    fs.writeFileSync(
      path.join(MOCK_DIR, "sample.js"),
      `// TODO: Refactor this function
// FIXME: This is broken
// SECURITY: Remove hardcoded credentials
// TODO(priority:p4): Nice-to-have improvement
function foo() {
  // HACK: Temporary workaround
  return 42;
}
`,
    );
  });

  afterAll(() => {
    // Clean up mockdata directory
    fs.rmSync(MOCK_DIR, { recursive: true, force: true });
  });

  test("Scans for TODOs and classifies priorities", () => {
    const files = [path.join(MOCK_DIR, "sample.js")];
    const todos = scanFilesForTodos(files, {
      tags: ["TODO", "FIXME", "HACK", "SECURITY", "BUG", "XXX"],
      contextLines: 2,
    });

    expect(todos.length).toBe(5);

    const priorities = todos.map(classifyPriority).map((r) => r.priority);
    expect(priorities).toEqual(["P3", "P2", "P1", "P4", "P3"]);

    // Check deduplication key and issue body rendering
    todos.forEach((todo) => {
      const key = generateTodoKey(todo);
      expect(typeof key).toBe("string");
      const body = renderIssueBody(
        todo,
        {
          branch: "test-branch",
          commit: "deadbeef",
          author: "test@example.com",
          timestamp: "2025-01-01T00:00:00Z",
        },
        classifyPriority(todo).rationale,
      );
      expect(body).toContain(todo.commentText);
      expect(body).toContain(key);
    });
  });
});
