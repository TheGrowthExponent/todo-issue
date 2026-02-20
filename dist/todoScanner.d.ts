import { Todo } from './types.js';
/**
 * Extracts TODO-style comments and associated metadata from a single file.
 *
 * @param filePath - Path to the file to scan
 * @param options - Options object:
 *   - tags: Array of tags to match (e.g., ['TODO', 'FIXME'])
 *   - contextLines: Number of lines before/after the TODO to include as context (default: 3)
 * @returns Array of Todo objects with extracted metadata
 */
export declare function scanFileForTodos(filePath: string, { tags, contextLines }: {
    tags: string[];
    contextLines?: number;
}): Todo[];
/**
 * Scans multiple files for TODO-style comments.
 *
 * @param filePaths - Array of file paths to scan
 * @param options - Options object (see scanFileForTodos)
 * @returns Array of Todo objects from all scanned files
 */
export declare function scanFilesForTodos(filePaths: string[], options: {
    tags: string[];
    contextLines?: number;
}): Todo[];
