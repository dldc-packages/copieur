import { ensureDir } from "@std/fs";
import { dirname, relative, resolve } from "@std/path";
import type { TAllPaths } from "./getAllPaths.ts";
import { taskLogger } from "./loggers.ts";

/**
 * Use block comment because they also work in CSS files
 */
const HEADER = [`/* SYNCED FILE */`, ``].join("\n");

export async function copyFiles(
  allPaths: TAllPaths,
  remoteFiles: string[],
): Promise<void> {
  taskLogger.log(`Copying ${String(remoteFiles.length)} files`);
  for (const file of remoteFiles) {
    const relPath = relative(allPaths.remote.source, file);
    const content = await Deno.readTextFile(file);
    const outContent = HEADER + content;
    const destFile = resolve(allPaths.local.source, relPath);
    const destDir = dirname(destFile);
    await ensureDir(destDir);
    await Deno.writeTextFile(destFile, outContent);
  }
  return;
}
