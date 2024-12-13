import { ensureDir } from "@std/fs";
import { dirname, relative, resolve } from "@std/path";

const HEADER = [`// SYNCED FILE`, ``].join("\n");

export async function copyFiles(
  repoPath: string,
  remotePath: string,
  localPath: string,
  files: string[]
): Promise<void> {
  const baseFolder = resolve(repoPath, remotePath);
  for (const file of files) {
    const relPath = relative(baseFolder, file);
    const content = await Deno.readTextFile(file);
    const outContent = HEADER + content;
    const destFile = resolve(localPath, relPath);
    const destDir = dirname(destFile);
    await ensureDir(destDir);
    await Deno.writeTextFile(destFile, outContent);
  }
  return;
}
