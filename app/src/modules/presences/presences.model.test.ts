import { describe, it, mock } from "node:test";
import { Presence } from "./presence.model.ts";
import assert from "node:assert/strict";
import { ValidationError } from "#shared";

describe("Presences validations", () => {
  it("Should throw ValidationError if 'enter' is more recent than 'exit'", async () => {
    const enterTime = new Date();
    const exitTime = new Date(Date.now() - 60_000);
    const presence = new Presence({
      data: {
        userUID: "abc",
        tenant: "swimmingpool1",
        enter: enterTime,
        exit: exitTime,
        createdAt: enterTime,
      },
    });
    const save = mock.fn(() => presence.save());
    await assert.rejects(save(), (error: unknown) => {
      assert.ok(error instanceof ValidationError);
      assert.equal(error.message, "'enter' cannot be more recent than 'exit'");
      assert.deepEqual(error.rawData, {
        enter: enterTime,
        exit: exitTime,
      });
      return true;
    });
    assert.equal(save.mock.callCount(), 1);
  });
});
