import { resolve } from "@std/path";
import * as v from "@valibot/valibot";
import { detailsLogger, jobLogger } from "./loggers.ts";

const ConfigJobSchema = v.object({
  name: v.string(),
  repo: v.string(),
  branch: v.string(),
  remotePath: v.string(),
  localPath: v.string(),
  patterns: v.array(v.string()),
  /**
   * Applied on top of "patterns"
   * Usefull to ignore all tests files for example (`*.test.ts`)
   */
  ignorePatterns: v.optional(v.array(v.string())),
});

export type TConfigJob = v.InferOutput<typeof ConfigJobSchema>;

const ConfigSchema = v.array(ConfigJobSchema);

export type TConfig = v.InferOutput<typeof ConfigSchema>;

export async function readConfig(): Promise<TConfig> {
  jobLogger.log(`Reading copieur.json`);
  const pathFile = resolve("copieur.json");
  const json = await Deno.readTextFile(pathFile);
  const configRaw = JSON.parse(json);
  const config = v.parse(ConfigSchema, configRaw);
  detailsLogger.log(`Found ${String(config.length)} jobs`);
  return config;
}
