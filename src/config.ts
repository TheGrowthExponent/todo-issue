// config.ts
// Loads and validates .todo-issue.yml config with sensible defaults

import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { IssueConfig } from "./types.js";

type Config = {
  scan: {
    tags: string[];
    ignore: string[];
    context_lines: number;
    diff_only: boolean;
  };
  issues: {
    assignee_strategy: "owner" | "author" | "none";
    milestone: string;
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
    tags: ["TODO", "FIXME", "HACK", "SECURITY", "BUG", "XXX"],
    ignore: ["node_modules/", "dist/", "**/*.min.js", "**/*.lock"],
    context_lines: 3,
    diff_only: true,
  },
  issues: {
    assignee_strategy: "owner",
    milestone: "backlog",
    labels: {
      p1: ["priority:critical", "security"],
      p2: ["priority:high", "bug"],
      p3: ["priority:medium", "tech-debt"],
      p4: ["priority:low", "enhancement"],
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
export function loadConfig(configPath: string = ".todo-issue.yml"): Config {
  let userConfig: Partial<Config> = {};
  const absPath = path.resolve(process.cwd(), configPath);

  if (fs.existsSync(absPath)) {
    try {
      const fileContent = fs.readFileSync(absPath, "utf8");
      userConfig = (yaml.load(fileContent) as Partial<Config>) || {};
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(
          `Failed to parse config file at ${configPath}: ${err.message}`,
        );
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
  if (typeof source !== "object" || source === null) return target;
  const output = { ...target };
  for (const key of Object.keys(source) as (keyof T)[]) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      output[key] = deepMerge((target[key] as any) || {}, source[key] as any);
    } else if (source[key] !== undefined) {
      output[key] = source[key] as T[typeof key];
    }
  }
  return output;
}
