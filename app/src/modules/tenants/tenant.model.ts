import { BaseModel } from "#models";
import { TenantSchema, type TenantRecord } from "./tenant.schema.ts";
import type { AllowedTenant } from "./tenant.types.ts";

type TenantData = Omit<TenantRecord, "id">;

export class Tenant extends BaseModel<TenantData, AllowedTenant> {
  readonly schema = TenantSchema.omit({ id: true });
  protected readonly idSchema = TenantSchema.shape.id;
  protected override readonly rejectDuplicateOnInsert = true;

  constructor(initialData: { id: AllowedTenant; data?: Partial<TenantData> }) {
    super("tenants", initialData);
  }

  setId(id: AllowedTenant): this {
    return this.assignId(id);
  }

  getTenant(): AllowedTenant {
    if (!this.id) {
      throw new Error("Tenant not set");
    }
    return this.id;
  }
}
