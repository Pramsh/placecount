import { PinoLogger } from "../../modules/logs/pinoLogger.ts";
import type { AllowedTenant } from "#modules/tenants";
import type {
  CustomErrorOptions,
  CustomErrorOptionsWithLog,
} from "#shared/types";

export class CustomError extends Error {
  public readonly reason: string | undefined;
  public readonly rawData: unknown | undefined;
  public readonly tenant: AllowedTenant | undefined;

  constructor(message: string, options?: CustomErrorOptions);
  constructor(message: string, options: CustomErrorOptionsWithLog);
  constructor(
    message: string,
    options?: CustomErrorOptions | CustomErrorOptionsWithLog,
  ) {
    super(message);

    this.name = new.target.name;
    this.reason = options?.reason;
    this.rawData = options?.rawData;
    this.tenant = options?.tenant;

    if (options && "storeLog" in options && options.storeLog) {
      const errorContext = {
        rawError: this,
        rawData: this.rawData,
        reason: this.reason,
        tenant: this.tenant,
      };

      const logger = new PinoLogger({
        tenant: options.tenant,
        source: "CustomError",
      });
      logger.error(message, errorContext);
    }
  }
}
