// todoScanner.js
// Scans files for TODO/FIXME/HACK/SECURITY/BUG/XXX comments and extracts metadata

import fs from "fs";
import path from "path";

/**
 * Supported comment tags (can be customized via config)
 * @example ['TODO', 'FIXME', 'HACK', 'SECURITY', 'BUG', 'XXX']
 */
function buildTagRegex(tags) {
  // Escape tags for regex
  const tagPattern = tags
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  // Match single-line and multi-line comment styles
  // Supports: // TODO, # TODO, -- TODO, /* TODO */, """ TODO """, ''' TODO '''
  return new RegExp(
    [
      // Single-line: // TODO, # TODO, -- TODO
      `(?:\\/\\/|#|--|;|%)\\s*(${tagPattern})(\\([^)]*\\))?:?\\s*(.*)`,
      // Multi-line: /* TODO ... */, """ TODO ... """, ''' TODO ... '''
      `(?:\\/\\*+|"""|''')\\s*(${tagPattern})(\\([^)]*\\))?:?\\s*([\\s\\S]*?)\\*+\\/|"""|'''`,
    ].join("|"),
    "gi",
  );
}

/**
 * Reads a file and returns its lines as an array
 */
function readFileLines(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return content.split(/\r?\n/);
}

/**
 * Extracts TODO comments and metadata from a file
 * @param {string} filePath - Path to the file
 * @param {object} options
 *   - tags: array of tags to match
 *   - contextLines: number of lines before/after to include as context
 * @returns {Array} - Array of TODO objects with metadata
 */
export function scanFileForTodos(filePath, { tags, contextLines = 3 }) {
  const results = [];
  const lines = readFileLines(filePath);
  const tagRegex = buildTagRegex(tags);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match;
    tagRegex.lastIndex = 0; // Reset regex state for global regex

    while ((match = tagRegex.exec(line))) {
      // Determine which capturing group matched (single-line or multi-line)
      const tag = match[1] || match[4];
      const meta = match[2] || match[5] || "";
      const commentText = (match[3] || match[6] || "").trim();

      // Extract author/priority from meta if present: e.g. (author), (priority:p2)
      let author = null,
        priority = null,
        issueRef = null;
      if (meta) {
        // e.g. (author), (priority:p2), (issue:#123)
        const authorMatch = meta.match(
          /([a-zA-Z0-9_.-]+@[a-zA-Z0-9_.-]+|[a-zA-Z0-9_.-]+)/,
        );
        if (authorMatch) author = authorMatch[1];
        const priorityMatch = meta.match(/priority\s*:\s*(p[1-4])/i);
        if (priorityMatch) priority = priorityMatch[1].toUpperCase();
        const issueMatch = meta.match(/issue\s*:\s*#?(\d+)/i);
        if (issueMatch) issueRef = issueMatch[1];
      }

      // Context lines
      const contextBefore = [];
      const contextAfter = [];
      for (let b = Math.max(0, i - contextLines); b < i; b++) {
        contextBefore.push(lines[b]);
      }
      for (
        let a = i + 1;
        a <= Math.min(lines.length - 1, i + contextLines);
        a++
      ) {
        contextAfter.push(lines[a]);
      }

      results.push({
        file: filePath,
        line: i + 1,
        tag,
        author,
        priority,
        issueRef,
        commentText,
        contextBefore,
        contextAfter,
        rawLine: line,
      });
    }
  }

  return results;
}

/**
 * Scans multiple files for TODOs
 * @param {string[]} filePaths
 * @param {object} options (see scanFileForTodos)
 * @returns {Array} - Array of TODO objects from all files
 */
export function scanFilesForTodos(filePaths, options) {
  const allTodos = [];
  for (const filePath of filePaths) {
    // Only scan text files (skip binaries)
    try {
      if (fs.statSync(filePath).isFile()) {
        const todos = scanFileForTodos(filePath, options);
        allTodos.push(...todos);
      }
    } catch (err) {
      // Ignore unreadable files
      continue;
    }
  }
  return allTodos;
}
