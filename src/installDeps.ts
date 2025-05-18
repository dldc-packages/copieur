import $ from "@david/dax";
import * as c from "@dldc/css-console";
import { parse as parseVersion, parseRange, satisfies } from "@std/semver";
import type { TAllPaths } from "./getAllPaths.ts";
import { getInstalledVersions } from "./getInstalledVersions.ts";
import { detailsLogger, taskLogger } from "./loggers.ts";
import { readPackageJson } from "./readPackageJson.ts";

export async function installDeps(
  allPaths: TAllPaths,
  deps: Record<string, string>,
): Promise<void> {
  taskLogger.log(`Installing dependencies`);
  const currentPkg = await readPackageJson(allPaths.local.packageJson);
  const packagesToInstall: string[] = [];
  const installedVersions = await getInstalledVersions();
  for (const [name, depVersion] of Object.entries(deps)) {
    const [specifier, requiredRange] = parseDepVersion(depVersion);
    const isInstalled = Boolean(
      currentPkg.dependencies?.[name] || currentPkg.devDependencies?.[name],
    );
    const installCommand = `${specifier}:${name}@${requiredRange}`;
    if (!isInstalled) {
      // Install the dependency
      packagesToInstall.push(installCommand);
      continue;
    }
    const currentVersion = installedVersions[name];
    if (!currentVersion) {
      detailsLogger.log(c.orange`Could not find installed version for ${name}`);
      // Install the dependency
      packagesToInstall.push(installCommand);
      continue;
    }
    if (
      !satisfies(
        parseVersion(currentVersion.version),
        parseRange(requiredRange),
      )
    ) {
      detailsLogger.log(
        c.red`Version mismatch for ${name}: required ${requiredRange}, found ${currentVersion.version}`,
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
  const escapedPackages = packagesToInstall.map((s) => $.escapeArg(s)).join(
    " ",
  );
  const lines = await $.raw`pnpm add ${escapedPackages}`.lines(
    "combined",
  );
  lines.forEach((line) => detailsLogger.log(line));
  detailsLogger.log(`Dependencies installed`);
}

function parseDepVersion(
  version: string,
): [sources: "npm" | "jsr", version: string] {
  if (version.startsWith("jsr:")) {
    return ["jsr", version.slice(4)];
  }
  if (version.startsWith("npm:")) {
    return ["npm", version.slice(4)];
  }
  return ["npm", version];
}
