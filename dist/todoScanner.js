// todoScanner.ts
// Scans files for TODO/FIXME/HACK/SECURITY/BUG/XXX comments and extracts metadata
import fs from 'fs';
/**
 * Builds a regular expression to match supported comment tags in various comment styles.
 * Supports single-line (//, #, --, ;, %) and multi-line (/*, """, ''') comment formats.
 *
 * @param tags - Array of tags to match (e.g., ['TODO', 'FIXME'])
 * @returns RegExp to match tagged comments
 */
function buildTagRegex(tags) {
    const tagPattern = tags.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    // Matches both single-line and multi-line comment styles
    // eslint-disable-next-line no-useless-escape -- Escapes are intentional for robustness across comment styles
    return new RegExp([
        // Single-line: // TODO, # TODO, -- TODO, etc.
        `(?:\\/\\/|#|--|;|%)\\s*(${tagPattern})(\\([^)]*\\))?:?\\s*(.*)`,
        // Multi-line: /* TODO ... */, """ TODO ... """, ''' TODO ... '''
        // eslint-disable-next-line no-useless-escape -- Escapes for ", ', and / are necessary for multi-line comment matching
        `(?:\\/\\*+|\"\"\"|''')\\s*(${tagPattern})(\\([^)]*\\))?:?\\s*([\\s\\S]*?)\\*+\\/|\"\"\"|'''`,
    ].join('|'), 'gi');
}
/**
 * Reads a file and returns its lines as an array of strings.
 *
 * @param filePath - Path to the file to read
 * @returns Array of lines from the file
 */
function readFileLines(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split(/\r?\n/);
}
/**
 * Extracts TODO-style comments and associated metadata from a single file.
 *
 * @param filePath - Path to the file to scan
 * @param options - Options object:
 *   - tags: Array of tags to match (e.g., ['TODO', 'FIXME'])
 *   - contextLines: Number of lines before/after the TODO to include as context (default: 3)
 * @returns Array of Todo objects with extracted metadata
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
            const meta = match[2] || match[5] || '';
            const commentText = (match[3] || match[6] || '').trim();
            // Extract author, priority, and issue reference from meta if present
            let author = null, priority = null, issueRef = null;
            if (meta) {
                // e.g. (author), (priority:p2), (issue:#123)
                const authorMatch = meta.match(/([a-zA-Z0-9_.-]+@[a-zA-Z0-9_.-]+|[a-zA-Z0-9_.-]+)/);
                if (authorMatch)
                    author = authorMatch[1];
                const priorityMatch = meta.match(/priority\s*:\s*(p[1-4])/i);
                if (priorityMatch)
                    priority = priorityMatch[1].toUpperCase();
                const issueMatch = meta.match(/issue\s*:\s*#?(\d+)/i);
                if (issueMatch)
                    issueRef = issueMatch[1];
            }
            // Gather context lines before and after the TODO
            const contextBefore = [];
            const contextAfter = [];
            for (let b = Math.max(0, i - contextLines); b < i; b++) {
                contextBefore.push(lines[b]);
            }
            for (let a = i + 1; a <= Math.min(lines.length - 1, i + contextLines); a++) {
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
 * Scans multiple files for TODO-style comments.
 *
 * @param filePaths - Array of file paths to scan
 * @param options - Options object (see scanFileForTodos)
 * @returns Array of Todo objects from all scanned files
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
        }
        catch {
            // Ignore unreadable files (e.g., permissions, binary, etc.)
            continue;
        }
    }
    return allTodos;
}
