import $ from "@david/dax";
import type { TAllPaths } from "./getAllPaths.ts";
import { detailsLogger, taskLogger } from "./loggers.ts";

export interface TRepo {
  path: string;
}

export async function cloneRepo(
  paths: TAllPaths,
  repo: string,
  branch: string,
): Promise<void> {
  taskLogger.log(`Cloning`);
  detailsLogger.log(`Cloning ${repo} on branch ${branch}`);
  const lines =
    await $`git clone --branch ${branch} --single-branch --depth 1 ${repo} ${paths.remote.base}`
      .lines("combined");

  lines.forEach((line) => detailsLogger.log(line));
  detailsLogger.log(`Clone Done`);
}
