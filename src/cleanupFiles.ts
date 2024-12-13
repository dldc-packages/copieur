import { walk } from "@std/fs";

export async function cleanupFiles(localPath: string, files: string[]) {
  const allFiles = await Array.fromAsync(
    walk(localPath, { includeDirs: false })
  );
  const diff = allFiles.filter((f) => !files.includes(f.path));
  console.log(`TODO: Cleanup ${diff.length} files`);
}
