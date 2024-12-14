import { expandGlob } from "@std/fs";
import type { TAllPaths } from "./getAllPaths.ts";
import { detailsLogger, taskLogger } from "./loggers.ts";

export async function resolveFiles(
  allPaths: TAllPaths,
  patterns: string[],
): Promise<string[]> {
  taskLogger.log(`Resolving files`);

  const files = new Set<string>();
  for (const pattern of patterns) {
    const patFiles = await Array.fromAsync(
      expandGlob(pattern, { root: allPaths.remote.source, includeDirs: false }),
    );
    for await (const file of patFiles) {
      files.add(file.path);
    }
  }
  const result = Array.from(files);
  detailsLogger.log(`Found ${result.length} files`);
  return result;
}
