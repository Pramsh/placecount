import { allowedTenants } from "./tenant.types.ts";
import { allowedLocales } from "#shared/types";
import { z } from "zod";

export type TenantRecord = z.infer<typeof TenantSchema>;

export const TenantSchema = z.object({
  id: z.enum(allowedTenants),
  locale: z.enum(allowedLocales),
});
