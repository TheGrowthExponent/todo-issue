import { Todo } from './types.js';
/**
 * Classifies the priority of a TODO comment based on tag, keywords, and optional manual override.
 *
 * Priority levels:
 * - P1: Critical (e.g., SECURITY, BUG, or critical keywords)
 * - P2: High (e.g., FIXME or high-severity bug keywords)
 * - P3: Medium (e.g., TODO, HACK, XXX, or tech debt keywords)
 * - P4: Low (e.g., nice-to-have, enhancement, or future work)
 *
 * @param {Todo} todo - The TODO object to classify.
 * @returns {{ priority: "P1" | "P2" | "P3" | "P4"; rationale: string }} The assigned priority and rationale.
 *
 * Classification rules:
 * 1. Manual override (priority in comment) always takes precedence.
 * 2. Tag-based rules: SECURITY/BUG → P1, FIXME → P2, TODO/HACK/XXX → P3 (unless keywords escalate/demote).
 * 3. Keyword-based rules: Escalate/demote based on presence of critical, high, medium, or low keywords.
 * 4. Default: If no tag/keyword match, assign P4.
 */
export declare function classifyPriority(todo: Todo): {
    priority: 'P1' | 'P2' | 'P3' | 'P4';
    rationale: string;
};
