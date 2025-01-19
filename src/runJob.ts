import { cleanupFiles } from "./cleanupFiles.ts";
import { cloneRepo } from "./cloneRepo.ts";
import { copyFiles } from "./copyFiles.ts";
import { getAllPaths } from "./getAllPaths.ts";
import { installDeps } from "./installDeps.ts";
import { jobLogger } from "./loggers.ts";
import type { TConfigJob } from "./readConfig.ts";
import { readPackageJson } from "./readPackageJson.ts";
import { resolveDeps } from "./resolveDeps.ts";
import { resolveFiles } from "./resolveFiles.ts";

export async function runJob(
  job: TConfigJob,
): Promise<void> {
  const {
    name,
    repo,
    branch,
    remotePath,
    patterns,
    localPath,
    ignorePatterns = [],
  } = job;
  jobLogger.log(`Running job ${name}`);
  const allPaths = await getAllPaths(remotePath, localPath);
  await cloneRepo(allPaths, repo, branch);
  const remotePkg = await readPackageJson(allPaths.remote.packageJson);
  const baseFiles = await resolveFiles(allPaths, patterns, ignorePatterns);
  const allDeps = await resolveDeps(allPaths, baseFiles, remotePkg);
  await copyFiles(allPaths, allDeps.files);
  await installDeps(allPaths, allDeps.dependencies);
  await cleanupFiles(allPaths, allDeps.files);
  await Deno.remove(allPaths.remote.base, { recursive: true });
}
