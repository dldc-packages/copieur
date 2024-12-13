import { resolve } from "@std/path";
import * as v from "@valibot/valibot";

const ConfigJobSchema = v.object({
  name: v.string(),
  repo: v.string(),
  branch: v.string(),
  remotePath: v.string(),
  localPath: v.string(),
  patterns: v.array(v.string()),
});

export type TConfigJob = v.InferOutput<typeof ConfigJobSchema>;

const ConfigSchema = v.array(ConfigJobSchema);

export type TConfig = v.InferOutput<typeof ConfigSchema>;

export async function readConfig(): Promise<TConfig> {
  const pathFile = resolve("copieur.json");
  const json = await Deno.readTextFile(pathFile);
  const configRaw = JSON.parse(json);
  const config = v.parse(ConfigSchema, configRaw);
  return config;
}
