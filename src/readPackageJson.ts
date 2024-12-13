import { resolve } from "@std/path";
import * as v from "@valibot/valibot";

export interface TPackageJson {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

const PackageJsonSchema = v.object({
  dependencies: v.record(v.string(), v.string()),
  devDependencies: v.record(v.string(), v.string()),
});

export async function readPackageJson(repoPath: string): Promise<TPackageJson> {
  const pathFile = resolve(repoPath, "package.json");
  const pkgRaw = await Deno.readTextFile(pathFile);
  const pkg = v.parse(PackageJsonSchema, JSON.parse(pkgRaw));
  return pkg;
}
