import type { ILogger, LogOptions } from "./log.types.ts";
import { serialize } from "../../shared/serialize.ts";
import { type FastifyBaseLogger } from "fastify";
import { logger } from "#core";

type PinoError = {
  source: string;
  message: string;
  context: unknown;
};
export class PinoLogger implements ILogger {
  private readonly logger: FastifyBaseLogger = logger;
  private readonly source: string;
  constructor(options: LogOptions) {
    this.source = options.source;
  }

  #normalizeData(message: string, context: unknown) {
    return serialize({
      source: this.source,
      message,
      context,
    });
  }
  info(message: string, context?: unknown): void {
    const serializedErr = this.#normalizeData(message, context) as PinoError;
    return this.logger.info(serializedErr);
  }
  debug(message: string, context?: unknown): void {
    const serializedErr = this.#normalizeData(message, context) as PinoError;
    return this.logger.debug(serializedErr);
  }
  warning(message: string, context?: unknown): void {
    const serializedErr = this.#normalizeData(message, context) as PinoError;
    return this.logger.warn(serializedErr);
  }
  error(message: string, context?: unknown): void {
    const serializedErr = this.#normalizeData(message, context) as PinoError;
    return this.logger.error(serializedErr);
  }
}
