import { allowedTenants } from "#modules/tenants";
import { z } from "zod";

export type PresenceRecord = z.infer<typeof PresenceSchema>;

export const PresenceSchema = z.object({
  userUID: z.string(),
  tenant: z.enum(allowedTenants),
  enter: z.date(),
  exit: z.date(),
  createdAt: z.date(),
});
