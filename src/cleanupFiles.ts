import { walk } from "@std/fs";
import { relative, resolve } from "@std/path";
import type { TAllPaths } from "./getAllPaths.ts";
import { detailsLogger, taskLogger } from "./loggers.ts";

export async function cleanupFiles(
  allPaths: TAllPaths,
  remoteFiles: string[],
) {
  taskLogger.log(`Cleanup files`);
  const relativeFiles = remoteFiles.map((f) =>
    relative(allPaths.remote.source, f)
  );
  const allFiles = await Array.fromAsync(
    walk(allPaths.local.source, { includeDirs: false }),
  );
  const allFilesRelative = allFiles.map((f) =>
    relative(allPaths.local.source, f.path)
  );
  const diff = allFilesRelative.filter((f) => !relativeFiles.includes(f));
  if (diff.length === 0) {
    detailsLogger.log(`Found no files to cleanup`);
    return;
  }
  detailsLogger.log(`Removing ${String(diff.length)} files`);
  for (const file of diff) {
    await Deno.remove(resolve(allPaths.local.source, file));
  }
}
