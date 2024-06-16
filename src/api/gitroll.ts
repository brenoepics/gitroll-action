import axios from "axios";
import * as core from "@actions/core";
import { handleError } from "../util/utils";
import puppeteer, { Browser, Page } from "puppeteer";
import { GitRoll } from "../util/constants";
import {
  GitRollResult,
  rank,
  scoreList,
  UNKNOWN_RESULT,
  userScan
} from "./types";

const REGEX_META_TAG: RegExp = /<meta property="og:image" content="(.*?)">/;
const WAIT_SCAN_TIMEOUT: number = 100 * 1000; // 100 seconds

/**
 *
 * @param username
 * @returns {Promise<userScan>} The scan results for the user.
 * @throws {Error} If the response from the API is invalid.
 */
export async function startScan(username: string): Promise<userScan> {
  return await axios
    .post(GitRoll.SCAN_API, {
      user: username
    })
    .then(response => {
      if (response.data satisfies userScan) {
        return response.data as userScan;
      }
      core.error("Invalid response from API");
      throw new Error("Invalid response from API");
    })
    .catch((reason: unknown) => {
      core.error(handleError(reason));
      throw new Error("Failed to get scan results");
    });
}

/**
 * Get the scan results for a user.
 * @param scan The scan to get the results for.
 * @param username The username of the user.
 */
export async function getScanResults(
  scan: userScan,
  username: string
): Promise<string | undefined> {
  const browser: Browser = await puppeteer.launch({ headless: true });
  const page: Page = await browser.newPage();
  const url: string = `${GitRoll.SCAN_URL}?id=${scan.id}&user=${username}&pid=${scan.profileId}&_rsc=5cmev`;
  await page.goto(url);
  await page.waitForNavigation({ timeout: WAIT_SCAN_TIMEOUT });
  return await page.content().then(content => {
    void browser.close();
    return REGEX_META_TAG.exec(content)?.[1];
  });
}

/**
 * Parse the contents of a URL into a GitRollResult.
 * @param url The URL to parse.
 * @returns {GitRollResult} The parsed contents of the URL.
 */
export function parseUrlContents(url: string): GitRollResult {
  url = url.replaceAll("amp;", "");
  const urlObj: URL = new URL(url);
  const params: URLSearchParams = new URLSearchParams(urlObj.search);
  const overallScore: number = parseFloat(params.get("overallScore") ?? "0");
  const overallScoreCDF: number = parseFloat(
    params.get("overallScoreCDF") ?? "0"
  );
  const isContributor: boolean = params.get("isContributor") === "true";
  const scoresList: number[] = (params.get("scores") ?? "0,0,0")
    .split(",")
    .map(score => parseFloat(score));
  const scores: scoreList = {
    reliability: scoresList[0],
    security: scoresList[1],
    maintainability: scoresList[2]
  };
  const regionRank: rank = parseRank("regionRank");
  const schoolRank: rank = parseRank("schoolRank");

  function parseRank(
    param: string,
    defaultValue: string = "100,Unknown"
  ): rank {
    const parsed: [number, string] = (params.get(param) ?? defaultValue)
      .split(",")
      .map(rank => rank.trim()) as [number, string];

    return {
      percentile: parsed[0],
      location: parsed[1]
    };
  }

  return {
    imageUrl: params.get("imageUrl") ?? "",
    devType: params.get("devType") ?? "",
    overallScore,
    overallScoreCDF,
    overallRatingLetter: params.get("overallRatingLetter") ?? "",
    isContributor,
    scores,
    regionRank,
    schoolRank
  };
}

/**
 * Get the results of a GitRoll scan.
 * @param pId The profile ID of the user.
 */
export async function getGitRollResult(pId: string): Promise<boolean> {
  try {
    await axios.get(`${GitRoll.SCAN_RESULTS}${pId}`);
  } catch (reason) {
    const err: string = handleError(reason);
    if (err === "User not found or has no scan-able repositories") {
      core.error(err);
      return false;
    }
  }
  return true;
}

/**
 * Run the GitRoll, trying to get the scan results for a user.
 * @param username GitHub username to scan.
 * @param waitForScan
 * @returns {Promise<GitRollResult>} The results of the scan.
 * @throws {Error} If we fail to get the profile or user has no scan-able repositories.
 */
export async function runGitRoll(
  username: string,
  waitForScan: boolean
): Promise<GitRollResult> {
  const toScan: userScan | null = await startScan(username).catch(() => null);
  if (toScan === null) {
    throw new Error("Failed to get profile");
  }

  core.info(
    `User ${username} [${toScan.profileId}] ${toScan.existing ? "does not have" : "has"} a new scan available`
  );

  if (!waitForScan) {
    return UNKNOWN_RESULT;
  }

  core.info("Waiting for scan to complete...");
  const results: string | undefined = await getResults(toScan, username);
  if (results === undefined) {
    throw new Error("Failed to get scan results");
  }

  return parseUrlContents(results);
}

/**
 * Get the scan results for a user.
 * @param toScan The scan to get the results for.
 * @param username The GitHub username scanned.
 */
async function getResults(toScan: userScan, username: string) {
  async function retry() {
    // ignore the error if the user has no scan-able repositories
    const success: boolean = await getGitRollResult(toScan.profileId);
    if (!success) {
      return undefined;
    }

    return await getScanResults(toScan, username);
  }

  return await getScanResults(toScan, username).catch(async () => {
    return await retry().catch((e: unknown) => {
      core.setFailed(handleError(e));
      return undefined;
    });
  });
}
