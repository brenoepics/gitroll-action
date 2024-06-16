import * as core from "@actions/core";
import { runGitRoll } from "./api/gitroll";
import { GitRollResult, UNKNOWN_RESULT } from "./api/types";

/**
 * The main function for the action.
 * @returns {void} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  const username: string = core.getInput("username");
  const waitForScan: boolean = core.getBooleanInput("wait");
  const content: GitRollResult = await startScan(username, waitForScan);
  core.info(`Results: ${JSON.stringify(content)}`);
  await Promise.resolve();
}

/**
 * Start a scan for a user.
 * @param username The GitHub username to scan.
 * @param waitForScan Whether to wait for the scan to complete.
 * @returns {Promise<GitRollResult>} The results of the scan.
 */
async function startScan(
  username: string,
  waitForScan: boolean
): Promise<GitRollResult> {
  let content: GitRollResult = UNKNOWN_RESULT;
  try {
    core.info(`Scanning ${username}...`);
    content = await runGitRoll(username, waitForScan);
  } catch (e) {
    core.setFailed(e as string);
  }
  return content;
}
