export const allowedTenants = [
  "swimmingpool1",
  "gym123",
  "test-tenant-concurrent",
] as const;
export type AllowedTenant = (typeof allowedTenants)[number];
