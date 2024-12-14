import { resolve } from "@std/path";

export interface TFolderPath {
  base: string;
  packageJson: string;
  source: string;
}

export interface TAllPaths {
  remote: TFolderPath;
  local: TFolderPath;
}

export async function getAllPaths(
  remotePath: string,
  localPath: string,
): Promise<TAllPaths> {
  const remoteBase = await Deno.makeTempDir();
  const remotePackageJson = resolve(remoteBase, "package.json");
  const remoteSource = resolve(remoteBase, remotePath);

  const localBase = Deno.cwd();
  const localPackageJson = resolve(localBase, "package.json");
  const localSource = resolve(localBase, localPath);

  return {
    remote: {
      base: remoteBase,
      packageJson: remotePackageJson,
      source: remoteSource,
    },
    local: {
      base: localBase,
      packageJson: localPackageJson,
      source: localSource,
    },
  };
}
