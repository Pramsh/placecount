import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Tenant } from "./tenant.model.ts";
import { DbConnector, ValidationError } from "#shared";
import type { AllowedTenant } from "./tenant.types.ts";

describe("Tenant validation", () => {
  it("Should not allow to create a tenant with an unallowed id", async () => {
    const tenant = new Tenant({
      id: "unallowedId" as AllowedTenant,
      data: { locale: "it" },
    });
    await assert.rejects(tenant.save(), (error: unknown) => {
      assert.ok(error instanceof ValidationError);
      assert.equal(error.message, "Invalid id for Tenant");
      return true;
    });
  });
  it("Should reject one concurrent insert for the same tenant ID", async () => {
    const id = "test-tenant-concurrent";
    const db = DbConnector.getInstance();
    const tenant = new Tenant({ id, data: { locale: "it" } });
    const second = new Tenant({ id, data: { locale: "en" } });
    const results = await Promise.allSettled([tenant.save(), second.save()]);
    const saved = results.filter((result) => result.status === "fulfilled");
    const rejected = results.filter((result) => result.status === "rejected");

    assert.equal(saved.length, 1);
    assert.equal(rejected.length, 1);
    assert.equal(rejected[0]!.reason.code, "23505");
    const { rows } = await db.query(
      'SELECT id, locale FROM "tenants" WHERE id = $1',
      [id],
    );
    assert.deepEqual(rows, [{ id, locale: saved[0]!.value.locale }]);
  });
});
