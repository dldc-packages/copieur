import * as c from "@dldc/css-console";

export type TLoggable = string | c.TStyledString;

export type TFormatMessage = (message: c.TStyledString) => c.TStyledString;

export interface TLogger {
  log: (messages: TLoggable) => void;
  child: (format?: TFormatMessage) => TLogger;
}

export function createLogger(format: TFormatMessage = (m) => m): TLogger {
  return {
    log,
    child: (formatChild = (m) => m) =>
      createLogger((m) => format(formatChild(m))),
  };

  function log(message: TLoggable) {
    logInternal(format(c.base(message)).messages);
  }

  function logInternal(messages: string[]) {
    console.log(...messages);
  }
}
