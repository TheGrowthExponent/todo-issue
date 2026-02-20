// priorityClassifier.ts
// Rule-based priority classifier for TODO comments
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
export function classifyPriority(todo) {
    // 1. Manual override always wins
    if (todo.priority && /^P[1-4]$/i.test(todo.priority)) {
        return {
            priority: todo.priority.toUpperCase(),
            rationale: `Manual override: priority specified as ${todo.priority.toUpperCase()} in comment.`,
        };
    }
    const tag = (todo.tag || '').toUpperCase();
    const text = (todo.commentText || '').toLowerCase();
    // 2. Tag-based rules (highest precedence after manual)
    if (tag === 'SECURITY' || tag === 'BUG') {
        return {
            priority: 'P1',
            rationale: `Tag-based: ${tag} tag triggers P1 CRITICAL.`,
        };
    }
    if (tag === 'FIXME') {
        return {
            priority: 'P2',
            rationale: 'Tag-based: FIXME tag triggers P2 HIGH.',
        };
    }
    if (['TODO', 'HACK', 'XXX'].includes(tag)) {
        // Will check keywords below for possible escalation/demotion
        // Otherwise, default to P3
    }
    // 3. Keyword-based rules
    // P1: Security/critical bug signals
    const p1Keywords = [
        'vulnerability',
        'injection',
        'xss',
        'auth bypass',
        'cve',
        'exploit',
        'unsafe',
        'credentials',
        'token leak',
        'rce',
        'critical',
        'security',
        'leak',
    ];
    for (const kw of p1Keywords) {
        if (text.includes(kw)) {
            return {
                priority: 'P1',
                rationale: `Keyword-based: "${kw}" found in comment triggers P1 CRITICAL.`,
            };
        }
    }
    // P2: High severity bug signals
    const p2Keywords = [
        'broken',
        'crash',
        'data loss',
        'race condition',
        'memory leak',
        'corruption',
        'regression',
        'null pointer',
        'undefined behaviour',
        'fail',
        'failure',
    ];
    for (const kw of p2Keywords) {
        if (text.includes(kw)) {
            return {
                priority: 'P2',
                rationale: `Keyword-based: "${kw}" found in comment triggers P2 HIGH.`,
            };
        }
    }
    // P3: Tech debt, refactor, workaround, etc.
    const p3Keywords = [
        'refactor',
        'cleanup',
        'improve',
        'optimise',
        'optimize',
        'technical debt',
        'workaround',
        'temporary',
        'legacy',
        'hack',
        'debt',
    ];
    for (const kw of p3Keywords) {
        if (text.includes(kw)) {
            return {
                priority: 'P3',
                rationale: `Keyword-based: "${kw}" found in comment triggers P3 MEDIUM.`,
            };
        }
    }
    // P4: Nice-to-have, future, enhancement, etc.
    const p4Keywords = [
        'nice-to-have',
        'future',
        'someday',
        'consider',
        'idea',
        'enhancement',
        'v2',
        'post-launch',
    ];
    for (const kw of p4Keywords) {
        if (text.includes(kw)) {
            return {
                priority: 'P4',
                rationale: `Keyword-based: "${kw}" found in comment triggers P4 LOW.`,
            };
        }
    }
    // 4. Default by tag
    if (['TODO', 'HACK', 'XXX'].includes(tag)) {
        return {
            priority: 'P3',
            rationale: `Default: ${tag} tag triggers P3 MEDIUM.`,
        };
    }
    // 5. Fallback
    return {
        priority: 'P4',
        rationale: 'Default: No tag or keyword match, assigned P4 LOW.',
    };
}
