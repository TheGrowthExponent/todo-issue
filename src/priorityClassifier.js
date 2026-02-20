todo-issue/src/priorityClassifier.js
// priorityClassifier.js
// Rule-based priority classifier for TODO comments

/**
 * Classifies the priority of a TODO comment based on tag, keywords, and optional manual override.
 * @param {object} todo - The TODO object (from scanner)
 *   - tag: string (e.g. TODO, FIXME, SECURITY, BUG, HACK, XXX)
 *   - commentText: string (the comment body)
 *   - priority: string|null (manual override, e.g. P1, P2, etc.)
 * @returns {object} - { priority: 'P1'|'P2'|'P3'|'P4', rationale: string }
 */
export function classifyPriority(todo) {
  // Manual override always wins
  if (todo.priority && /^P[1-4]$/i.test(todo.priority)) {
    return {
      priority: todo.priority.toUpperCase(),
      rationale: `Manual override: priority specified as ${todo.priority.toUpperCase()} in comment.`
    };
  }

  const tag = (todo.tag || '').toUpperCase();
  const text = (todo.commentText || '').toLowerCase();

  // Tag-based rules (highest precedence)
  if (tag === 'SECURITY' || tag === 'BUG') {
    return {
      priority: 'P1',
      rationale: `Tag-based: ${tag} tag triggers P1 CRITICAL.`
    };
  }
  if (tag === 'FIXME') {
    return {
      priority: 'P2',
      rationale: 'Tag-based: FIXME tag triggers P2 HIGH.'
    };
  }
  if (['TODO', 'HACK', 'XXX'].includes(tag)) {
    // Will check keywords below for possible escalation/demotion
    // Otherwise, default to P3
  }

  // Keyword-based rules
  // P1: Security/critical bug signals
  const p1Keywords = [
    'vulnerability', 'injection', 'xss', 'auth bypass', 'cve', 'exploit',
    'unsafe', 'credentials', 'token leak', 'rce', 'critical', 'security', 'leak'
  ];
  for (const kw of p1Keywords) {
    if (text.includes(kw)) {
      return {
        priority: 'P1',
        rationale: `Keyword-based: "${kw}" found in comment triggers P1 CRITICAL.`
      };
    }
  }

  // P2: High severity bug signals
  const p2Keywords = [
    'broken', 'crash', 'data loss', 'race condition', 'memory leak',
    'corruption', 'regression', 'null pointer', 'undefined behaviour', 'fail', 'failure'
  ];
  for (const kw of p2Keywords) {
    if (text.includes(kw)) {
      return {
        priority: 'P2',
        rationale: `Keyword-based: "${kw}" found in comment triggers P2 HIGH.`
      };
    }
  }

  // P3: Tech debt, refactor, workaround, etc.
  const p3Keywords = [
    'refactor', 'cleanup', 'improve', 'optimise', 'optimize', 'technical debt',
    'workaround', 'temporary', 'legacy', 'hack', 'debt'
  ];
  for (const kw of p3Keywords) {
    if (text.includes(kw)) {
      return {
        priority: 'P3',
        rationale: `Keyword-based: "${kw}" found in comment triggers P3 MEDIUM.`
      };
    }
  }

  // P4: Nice-to-have, future, enhancement, etc.
  const p4Keywords = [
    'nice-to-have', 'future', 'someday', 'consider', 'idea', 'enhancement', 'v2', 'post-launch'
  ];
  for (const kw of p4Keywords) {
    if (text.includes(kw)) {
      return {
        priority: 'P4',
        rationale: `Keyword-based: "${kw}" found in comment triggers P4 LOW.`
      };
    }
  }

  // Default by tag
  if (['TODO', 'HACK', 'XXX'].includes(tag)) {
    return {
      priority: 'P3',
      rationale: `Default: ${tag} tag triggers P3 MEDIUM.`
    };
  }

  // Fallback
  return {
    priority: 'P4',
    rationale: 'Default: No tag or keyword match, assigned P4 LOW.'
  };
}
