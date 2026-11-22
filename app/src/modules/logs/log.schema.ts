import { z } from "zod";
import { logSeverities } from "./log.types.ts";
import { allowedTenants } from "#modules/tenants";

export const logSchema = z.object({
  timestamp: z.date(),
  tenant: z.enum(allowedTenants),
  source: z.string(),
  severity: z.enum(logSeverities),
  message: z.string(),
  context: z.nullable(z.json()),
});

export type LogRecord = z.infer<typeof logSchema>;
