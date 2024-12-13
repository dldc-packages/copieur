import $ from "@david/dax";
import { parseRange, parse as parseVersion, satisfies } from "@std/semver";
import { getInstalledVersion } from "./getInstalledVersion.ts";
import { readPackageJson } from "./readPackageJson.ts";

export async function installDeps(deps: Record<string, string>): Promise<void> {
  const currentPkg = await readPackageJson(".");
  const packagesToInstall: string[] = [];
  for (const [name, requiredRange] of Object.entries(deps)) {
    const isInstalled = Boolean(
      currentPkg.dependencies?.[name] || currentPkg.devDependencies?.[name]
    );
    if (!isInstalled) {
      // Install the dependency
      packagesToInstall.push(`${name}@${requiredRange}`);
      continue;
    }
    const currentVersion = await getInstalledVersion(name);
    if (!currentVersion) {
      console.warn(`Could not find installed version for ${name}`);
      // Install the dependency
      packagesToInstall.push(`${name}@${requiredRange}`);
      continue;
    }
    if (!satisfies(parseVersion(currentVersion), parseRange(requiredRange))) {
      console.error(
        `Version mismatch for ${name}: required ${requiredRange}, found ${currentVersion}`
      );
      continue;
    }
    // Dependency is already installed and satisfies the required version
  }

  if (packagesToInstall.length === 0) {
    console.log("All dependencies are already installed");
    return;
  }
  console.log(`Installing ${packagesToInstall.join(", ")}`);
  await $`pnpm install ${packagesToInstall.join(" ")}`;
}
