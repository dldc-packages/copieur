import $ from "@david/dax";
import * as v from "@valibot/valibot";

const ListSchema = v.array(
  v.object({
    name: v.string(),
    version: v.string(),
    dependencies: v.optional(
      v.record(
        v.string(),
        v.object({
          version: v.string(),
        })
      )
    ),
    devDependencies: v.optional(
      v.record(
        v.string(),
        v.object({
          version: v.string(),
        })
      )
    ),
  })
);

export async function getInstalledVersion(
  name: string
): Promise<string | null> {
  const currentVersion = await $`pnpm list --depth 0 --json ${name}`.json();
  const result = v.parse(ListSchema, currentVersion);
  if (result.length === 0) {
    return null;
  }
  const deps =
    result[0].dependencies?.[name] ?? result[0].devDependencies?.[name];
  if (!deps) {
    return null;
  }
  return deps.version;
}
