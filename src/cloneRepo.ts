import $ from "@david/dax";
import type { TLogger } from "./logger.ts";

export interface TRepo {
  path: string;
}

export async function cloneRepo(
  logger: TLogger,
  repo: string,
  branch: string
): Promise<TRepo> {
  const path = await Deno.makeTempDir();
  logger.log(`Cloning ${repo} on branch ${branch}`);

  const lines =
    await $`git clone --branch ${branch} --single-branch --depth 1 ${repo} ${path}`.lines();

  lines.forEach((line) => logger.log(line));
  return { path };
}
