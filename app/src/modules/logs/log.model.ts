import { logSchema, type LogRecord } from "./log.schema.ts";
import { BaseModel } from "#models";
import type { ILogger, LogOptions, Severity } from "./log.types.ts";
import { serialize } from "#shared";
import type { JSONType } from "zod";
import type { AllowedTenant } from "#modules/tenants";

export class Log extends BaseModel<LogRecord> implements ILogger {
  readonly schema = logSchema;
  private readonly source: string;
  private readonly tenant: AllowedTenant;

  constructor({ source, tenant }: LogOptions) {
    super("logs");
    this.source = source;
    this.tenant = tenant;
  }

  #normalize(value: unknown): JSONType {
    return serialize(value) as JSONType;
  }

  async #write(severity: Severity, message: string, context?: unknown) {
    const record: LogRecord = {
      source: this.source,
      tenant: this.tenant,
      severity,
      message,
      timestamp: new Date(),
      ...(context === undefined
        ? { context: null }
        : { context: this.#normalize(context) }),
    };

    this.setMany(record);
    await this.save();
  }

  info(message: string, context?: unknown): Promise<void> {
    return this.#write("info", message, context);
  }

  debug(message: string, context?: unknown): Promise<void> {
    return this.#write("debug", message, context);
  }

  warning(message: string, context?: unknown): Promise<void> {
    return this.#write("warning", message, context);
  }

  error(message: string, context?: unknown): Promise<void> {
    return this.#write("error", message, context);
  }
}
