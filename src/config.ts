// config.ts
// Loads and validates .todo-issue.yml config with sensible defaults

/**
 * @fileoverview
 * Configuration loader and schema for the TODO→ISSUE GitHub Action.
 * Handles merging user config with defaults, validation, and type definitions.
 * Supports YAML config files for flexible customization.
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

/**
 * Configuration schema for TODO→ISSUE Action.
 */
type Config = {
  scan: {
    tags: string[];
    ignore: string[];
    context_lines: number;
    diff_only: boolean;
  };
  issues: {
    assignee_strategy: 'owner' | 'author' | 'none';
    milestone: number;
    labels: {
      p1: string[];
      p2: string[];
      p3: string[];
      p4: string[];
    };
    require_owner_tag: boolean;
  };
  blocking: {
    fail_on_p1: boolean;
    fail_on_p2: boolean;
  };
};

const DEFAULT_CONFIG: Config = {
  scan: {
    tags: ['TODO', 'FIXME', 'HACK', 'SECURITY', 'BUG', 'XXX'],
    ignore: ['node_modules/', 'dist/', '**/*.min.js', '**/*.lock'],
    context_lines: 3,
    diff_only: true,
  },
  issues: {
    assignee_strategy: 'owner',
    milestone: 1,
    labels: {
      p1: ['priority:critical', 'security'],
      p2: ['priority:high', 'bug'],
      p3: ['priority:medium', 'tech-debt'],
      p4: ['priority:low', 'enhancement'],
    },
    require_owner_tag: false,
  },
  blocking: {
    fail_on_p1: true,
    fail_on_p2: false,
  },
};

/**
 * Loads the .todo-issue.yml config file from the repo root, merges with defaults.
 * @param configPath - Path to the config file (default: .todo-issue.yml)
 * @returns The merged config object
 */
export function loadConfig(configPath: string = '.todo-issue.yml'): Config {
  let userConfig: Partial<Config> = {};
  const absPath = path.resolve(process.cwd(), configPath);

  if (fs.existsSync(absPath)) {
    try {
      const fileContent = fs.readFileSync(absPath, 'utf8');
      const loadedConfig = yaml.load(fileContent);
      userConfig =
        typeof loadedConfig === 'object' && loadedConfig !== null
          ? (loadedConfig as Partial<Config>)
          : {};
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to parse config file at ${configPath}: ${err.message}`);
      }
      throw err;
    }
  }

  // Deep merge userConfig into DEFAULT_CONFIG
  return deepMerge(DEFAULT_CONFIG, userConfig);
}

/**
 * Deep merge two objects (simple implementation for config)
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
  if (typeof source !== 'object' || source === null) return target;
  const output = { ...target };
  for (const key of Object.keys(source) as (keyof T)[]) {
    const value = source[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      output[key] = deepMerge((target[key] as any) || {}, value as any);
    } else if (value !== undefined) {
      // Type guard to reduce unsafe any warning
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        Array.isArray(value)
      ) {
        output[key] = value as T[typeof key];
      } else if (typeof value === 'object' && value !== null) {
        output[key] = deepMerge((target[key] as any) || {}, value as any);
      }
    }
  }
  return output;
}
