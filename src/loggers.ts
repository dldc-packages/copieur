import * as c from "@dldc/css-console";
import { createLogger } from "./createLogger.ts";

export const jobLogger = createLogger((m) => c.blueLight(m));

export const taskLogger = createLogger((m) => c.blueDark`  ${m}`);

export const detailsLogger = createLogger((m) => c.slateDark`    ${m}`);
