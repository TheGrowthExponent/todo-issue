import * as github from '@actions/github';
export declare function getChangedFiles(octokit?: ReturnType<typeof github.getOctokit> | null): Promise<string[]>;
