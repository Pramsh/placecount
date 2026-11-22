import { type PresenceRecord, PresenceSchema } from "./presence.schema.ts";
import { ValidationError } from "#shared";
import { BaseModel, type ModelInitialData } from "#models";

export class Presence extends BaseModel<PresenceRecord> {
  readonly schema = PresenceSchema;

  constructor(initialData: ModelInitialData<PresenceRecord, string> = {}) {
    super("presences", initialData);
  }

  setId(id: string): this {
    return this.assignId(id);
  }

  validate(data: unknown = this.data): PresenceRecord {
    const validData = super.validate(data);

    if (validData.exit && validData.enter && validData.exit < validData.enter) {
      throw new ValidationError("'enter' cannot be more recent than 'exit'", {
        tenant: validData.tenant,
        rawData: {
          enter: validData.enter,
          exit: validData.exit,
        },
      });
    }

    return validData;
  }
}
