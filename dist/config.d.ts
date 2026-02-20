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
/**
 * Loads the .todo-issue.yml config file from the repo root, merges with defaults.
 * @param configPath - Path to the config file (default: .todo-issue.yml)
 * @returns The merged config object
 */
export declare function loadConfig(configPath?: string): Config;
export {};
