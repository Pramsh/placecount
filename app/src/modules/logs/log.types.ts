import type { AllowedTenant } from "#modules/tenants";

export interface ILogger {
  info: (message: string, context?: unknown) => Promise<void> | void;
  warning: (message: string, context?: unknown) => Promise<void> | void;
  debug: (message: string, context?: unknown) => Promise<void> | void;
  error: (message: string, context?: unknown) => Promise<void> | void;
}
export const logSeverities = ["info", "debug", "warning", "error"] as const;

export type Severity = (typeof logSeverities)[number];
export type LogOptions = {
  source: string;
  tenant: AllowedTenant;
};
