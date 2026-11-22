import type { AllowedTenant } from "#modules/tenants";

export type CustomErrorOptions = {
  tenant: AllowedTenant;
  reason?: string;
  rawData?: unknown;
};

export type CustomErrorOptionsWithLog = {
  source: string;
  storeLog: boolean;
} & CustomErrorOptions;
