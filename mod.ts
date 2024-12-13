import { readConfig } from "./src/readConfig.ts";
import { runJob } from "./src/runJob.ts";

const jobs = await readConfig();

for (const job of jobs) {
  await runJob(job);
}
