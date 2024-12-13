import { cleanupFiles } from "./cleanupFiles.ts";
import { cloneRepo } from "./cloneRepo.ts";
import { copyFiles } from "./copyFiles.ts";
import { installDeps } from "./installDeps.ts";
import { createLogger } from "./logger.ts";
import type { TConfigJob } from "./readConfig.ts";
import { readPackageJson } from "./readPackageJson.ts";
import { resolveDeps } from "./resolveDeps.ts";
import { resolveFiles } from "./resolveFiles.ts";

export async function runJob(job: TConfigJob): Promise<void> {
  const { name, repo, branch, remotePath, patterns, localPath } = job;
  const logger = createLogger({ header: [`Running job ${name}`] });

  const cloned = await cloneRepo(logger, repo, branch);
  const remotePkg = await readPackageJson(cloned.path);
  const baseFiles = await resolveFiles(cloned.path, remotePath, patterns);
  const allDeps = await resolveDeps(
    cloned.path,
    remotePath,
    baseFiles,
    remotePkg
  );
  await copyFiles(cloned.path, remotePath, localPath, allDeps.files);
  await installDeps(allDeps.dependencies);
  await cleanupFiles(localPath, allDeps.files);
}
