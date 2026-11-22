import { describe, it } from "node:test";
import { Log } from "./log.model.ts";
import { deepEqual, strictEqual } from "node:assert";
import { logSeverities } from "#modules/logs";
import { serialize } from "#shared";

describe(
  "Create new logs with different severities and retrieve them from db",
  { concurrency: true }, //theoretically it's concurrrent also without but improves 10ms performances
  async () => {
    const expectedSource = "test";

    const assertSource = (storedSource: string) => {
      strictEqual(
        storedSource,
        expectedSource,
        `source value received is "${storedSource}" instead of "${expectedSource}"`,
      );
    };

    const assertMessage = (expectedMessage: string, storedMessage: string) => {
      strictEqual(
        storedMessage,
        expectedMessage,
        `message value received is "${storedMessage}" instead of "${expectedMessage}"`,
      );
    };

    const assertContext = (
      expectedContext: unknown,
      storedContext: unknown,
    ) => {
      deepEqual(storedContext, expectedContext);
    };

    await Promise.all(
      logSeverities.map((severity) =>
        it(`Should successfully store and retrieve from db a ${severity} severity log`, async () => {
          const expectedMessage = `Creation of a new ${severity} log`;
          const logger = new Log({ tenant: "gym123", source: expectedSource });

          let expectedContext: unknown = null;

          switch (severity) {
            case "info":
              expectedContext = { data: "ok" };
              await logger.info(expectedMessage, expectedContext);
              break;

            case "debug":
              expectedContext = { data: { data: "debug log" } };
              await logger.debug(expectedMessage, expectedContext);
              break;

            case "warning":
              await logger.warning(expectedMessage);
              break;

            case "error": {
              const error = new Error("Error message for log");
              expectedContext = serialize(error);
              await logger.error(expectedMessage, error);
              break;
            }

            default:
              throw new Error(`Unhandled severity: ${severity}`);
          }

          const id = logger.getId();
          if (!id) throw new Error("Log ID was not generated");

          const storedLog = await logger.fetch(id);

          assertSource(storedLog.source);
          assertMessage(expectedMessage, storedLog.message);
          assertContext(expectedContext, storedLog.context);
        }),
      ),
    );
  },
);
