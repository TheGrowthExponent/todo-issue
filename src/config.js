todo-issue/src/config.js
// config.js
// Loads and validates .todo-issue.yml config with sensible defaults

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const DEFAULT_CONFIG = {
  scan: {
    tags: ['TODO', 'FIXME', 'HACK', 'SECURITY', 'BUG', 'XXX'],
    ignore: [
      'node_modules/',
      'dist/',
      '**/*.min.js',
      '**/*.lock'
    ],
    context_lines: 3,
    diff_only: true
  },
  issues: {
    assignee_strategy: 'owner', // owner | author | none
    milestone: 'backlog',
    labels: {
      p1: ['priority:critical', 'security'],
      p2: ['priority:high', 'bug'],
      p3: ['priority:medium', 'tech-debt'],
      p4: ['priority:low', 'enhancement']
    },
    require_owner_tag: false
  },
  blocking: {
    fail_on_p1: true,
    fail_on_p2: false
  }
};

/**
 * Loads the .todo-issue.yml config file from the repo root, merges with defaults.
 * @param {string} configPath - Path to the config file (default: .todo-issue.yml)
 * @returns {object} - The merged config object
 */
export function loadConfig(configPath = '.todo-issue.yml') {
  let userConfig = {};
  const absPath = path.resolve(process.cwd(), configPath);

  if (fs.existsSync(absPath)) {
    try {
      const fileContent = fs.readFileSync(absPath, 'utf8');
      userConfig = yaml.load(fileContent) || {};
    } catch (err) {
      throw new Error(`Failed to parse config file at ${configPath}: ${err.message}`);
    }
  }

  // Deep merge userConfig into DEFAULT_CONFIG
  return deepMerge(DEFAULT_CONFIG, userConfig);
}

/**
 * Deep merge two objects (simple implementation for config)
 */
function deepMerge(target, source) {
  if (typeof source !== 'object' || source === null) return target;
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}
