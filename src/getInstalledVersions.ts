import $ from "@david/dax";
import * as v from "@valibot/valibot";

const DepsVersionRecord = v.record(
  v.string(),
  v.object({
    from: v.string(),
    version: v.string(),
  }),
);
export interface TDepInfos {
  name: string;
  from: string;
  version: string;
}

export type TDepsVersionRecord = Record<string, TDepInfos>;

const ListSchema = v.array(
  v.object({
    name: v.string(),
    version: v.string(),
    dependencies: v.optional(
      DepsVersionRecord,
    ),
    devDependencies: v.optional(
      DepsVersionRecord,
    ),
  }),
);

export async function getInstalledVersions(): Promise<TDepsVersionRecord> {
  const currentVersion = await $`pnpm list --depth 0 --json`.json();
  const result = v.parse(ListSchema, currentVersion);
  if (result.length === 0) {
    throw new Error("Unexpected: pnpm list returned an empty array");
  }
  const allDeps: TDepsVersionRecord = {};
  Object.entries(result[0].dependencies ?? []).forEach(([name, info]) => {
    allDeps[name] = { name, ...info };
  });
  Object.entries(result[0].devDependencies ?? []).forEach(([name, info]) => {
    allDeps[name] = { name, ...info };
  });
  return allDeps;
}
