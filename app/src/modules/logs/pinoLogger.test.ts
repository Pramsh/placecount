import { logSeverities } from "#modules/logs";
import { describe, it } from "node:test";
import { PinoLogger } from "./pinoLogger.ts";

describe("Pino logs", { concurrency: true }, () => {
  const logger = new PinoLogger({
    tenant: "swimmingpool1",
    source: "test-pino",
  });
  const caseObj: Record<
    (typeof logSeverities)[number],
    Record<"context", unknown>
  > = Object.freeze({
    info: {
      context: "basic context",
    },
    debug: {
      context: {
        randomKey: "an obj bit more complex context",
      },
    },
    warning: {
      context: {
        double_nested: {
          differentValues: {
            aBool: true,
            aStr: "stringa-random",
            anotherObj: {
              aBool: false,
              aNumber: 12,
            },
          },
        },
      },
    },
    error: {
      context: {
        anErr: new Error("errore random"),
        anObj: {
          aString: "string-random",
        },
      },
    },
  });

  it("Class should be able to use a method for each severity", async (t) => {
    await Promise.all(
      logSeverities.map((severity) =>
        t.test(`pinolog test with severity: '${severity}'`, () => {
          const message = `${severity} message`;
          logger[severity](message, caseObj[severity].context);
        }),
      ),
    );
  });
});
