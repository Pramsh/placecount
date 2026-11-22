import { PinoLogger } from "./pinoLogger.ts";
import { Log } from "./log.model.ts";
import type { ILogger } from "./log.types.ts";
import type { AllowedTenant } from "#modules/tenants";

export const createLogger = (
  tenant: AllowedTenant,
  source: string,
  storeInDb: boolean = false,
): ILogger =>
  storeInDb ? new Log({ tenant, source }) : new PinoLogger({ tenant, source });
