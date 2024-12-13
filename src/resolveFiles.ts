import { expandGlob } from "@std/fs";
import { resolve } from "@std/path";

export async function resolveFiles(
  repoPath: string,
  remotePath: string,
  patterns: string[],
): Promise<string[]> {
  const baseFolder = resolve(repoPath, remotePath);
  const files = new Set<string>();

  for (const pattern of patterns) {
    const patFiles = await Array.fromAsync(
      expandGlob(pattern, { root: baseFolder, includeDirs: false }),
    );
    for await (const file of patFiles) {
      files.add(file.path);
    }
  }
  return Array.from(files);
}
