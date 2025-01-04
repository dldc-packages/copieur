import $ from "@david/dax";
import * as c from "@dldc/css-console";
import { parse as parseVersion, parseRange, satisfies } from "@std/semver";
import type { TAllPaths } from "./getAllPaths.ts";
import { getInstalledVersion } from "./getInstalledVersion.ts";
import { detailsLogger, taskLogger } from "./loggers.ts";
import { readPackageJson } from "./readPackageJson.ts";

export async function installDeps(
  allPaths: TAllPaths,
  deps: Record<string, string>,
): Promise<void> {
  taskLogger.log(`Installing dependencies`);
  const currentPkg = await readPackageJson(allPaths.local.packageJson);
  const packagesToInstall: string[] = [];
  for (const [name, requiredRange] of Object.entries(deps)) {
    const isInstalled = Boolean(
      currentPkg.dependencies?.[name] || currentPkg.devDependencies?.[name],
    );
    if (!isInstalled) {
      // Install the dependency
      packagesToInstall.push(`${name}@${requiredRange}`);
      continue;
    }
    const currentVersion = await getInstalledVersion(name);
    if (!currentVersion) {
      detailsLogger.log(c.orange`Could not find installed version for ${name}`);
      // Install the dependency
      packagesToInstall.push(`${name}@${requiredRange}`);
      continue;
    }
    if (!satisfies(parseVersion(currentVersion), parseRange(requiredRange))) {
      detailsLogger.log(
        c.red`Version mismatch for ${name}: required ${requiredRange}, found ${currentVersion}`,
      );
      continue;
    }
    // Dependency is already installed and satisfies the required version
  }

  if (packagesToInstall.length === 0) {
    detailsLogger.log(`All dependencies are already installed`);
    return;
  }
  detailsLogger.log(`Installing ${packagesToInstall.join(", ")}`);
  const lines = await $`pnpm add ${packagesToInstall}`.lines(
    "combined",
  );
  lines.forEach((line) => detailsLogger.log(line));
  detailsLogger.log(`Dependencies installed`);
}
