import * as v from "@valibot/valibot";

export interface TPackageJson {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

const PackageJsonSchema = v.object({
  dependencies: v.record(v.string(), v.string()),
  devDependencies: v.record(v.string(), v.string()),
});

export async function readPackageJson(path: string): Promise<TPackageJson> {
  const pkgRaw = await Deno.readTextFile(path);
  const pkg = v.parse(PackageJsonSchema, JSON.parse(pkgRaw));
  return pkg;
}
