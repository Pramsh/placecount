import type { QueryResultRow } from "pg";
import { type ZodType } from "zod";
import { DbConnector } from "#shared";
import { type DbRow } from "#shared/types";
import { ValidationError, DbError } from "#shared/errors";
import { isDeepStrictEqual } from "node:util";
import { type AllowedTables } from "./config/types..ts";
import type { AllowedTenant } from "#modules/tenants";

export type ModelInitialData<TData, TId> = {
  data?: Partial<TData>;
  id?: TId;
};

export abstract class BaseModel<TData extends QueryResultRow, TId = string> {
  protected readonly db = DbConnector.getInstance();
  protected originalData: Partial<TData> | undefined;
  protected data: Partial<TData> = {};
  protected id: TId | undefined;

  abstract readonly schema: ZodType<TData>;
  protected readonly idSchema?: ZodType<TId>;
  protected readonly rejectDuplicateOnInsert: boolean = false;
  protected readonly tableName: string;
  constructor(
    tableName: AllowedTables,
    initialData: ModelInitialData<TData, TId> = {},
  ) {
    if (!tableName.trim()) {
      throw new Error("tableName cannot be empty");
    }

    this.tableName = tableName;
    this.id = initialData.id;
    this.data = Object.assign({}, initialData.data);
  }

  getId(): TId | undefined {
    return this.id;
  }

  getTenant(): AllowedTenant {
    if (!this.data.tenant) {
      throw new ValidationError("Tenant not available");
    }
    return this.data.tenant;
  }

  protected assignId(id: TId): this {
    if (id !== this.id) this.originalData = undefined;
    this.id = id;
    return this;
  }

  set<K extends keyof TData>(key: K, value: TData[K]): this {
    this.data[key] = value;
    return this;
  }

  get<K extends keyof TData>(key: K): TData[K] | undefined {
    return this.data[key] as TData[K] | undefined;
  }

  #hasChanges(): boolean {
    if (!this.originalData) {
      return true;
    }

    return !isDeepStrictEqual(this.validate(), this.originalData);
  }

  async fetch(id: TId): Promise<DbRow<TData, TId>> {
    const result = await this.db.query<DbRow<TData, TId>>(
      `SELECT * FROM "${this.tableName}" WHERE "id" = $1`,
      [id],
    );

    const row = result.rows[0];

    if (!row) {
      throw new DbError(`Record not found for id: ${String(id)}`, {
        tenant: this.getTenant(),
        storeLog: true,
        source: "BaseModel",
      });
    }

    const { id: rowId, ...payload } = row;

    this.id = rowId;
    this.data = this.validate(payload);
    this.originalData = structuredClone(this.data);

    return row;
  }

  setMany(data: Partial<TData>): this {
    Object.assign(this.data, data);
    return this;
  }

  validate(data: unknown = this.data): TData {
    const idResult = this.idSchema?.safeParse(this.id);
    if (idResult && !idResult.success) {
      throw new ValidationError(`Invalid id for ${this.constructor.name}`);
    }
    const result = this.schema.safeParse(data);

    if (!result.success) {
      throw new ValidationError(
        `Invalid model data for ${this.constructor.name}`,
        {
          tenant: this.getTenant(),
          reason: result.error.message,
          rawData: result.error.issues,
          storeLog: true,
          source: "BaseModel",
        },
      );
    }

    return result.data;
  }

  async save(): Promise<DbRow<TData, TId>> {
    const validData = this.validate();
    const entries = Object.entries(validData);

    if (entries.length === 0) {
      throw new ValidationError(
        `Cannot save empty data for ${this.constructor.name}`,
        {
          tenant: this.getTenant(),
          rawData: this.data,
          reason: "Trying to store empty data",
          storeLog: true,
          source: "BaseModel",
        },
      );
    }

    const fields = entries.map(([key]) => key);
    const values = entries.map(([, value]) => value);

    if (this.id != null && !this.#hasChanges()) {
      return {
        ...this.originalData!,
        id: this.id,
      } as DbRow<TData, TId>;
    }
    if (this.id != null) {
      fields.unshift("id");
      values.unshift(this.id);
    }

    const columns = fields.map((field) => `"${field}"`).join(", ");
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

    const updateFields = fields.filter((field) => field !== "id");

    const conflictAction = updateFields
      .map((field) => `"${field}" = EXCLUDED."${field}"`)
      .join(", ");

    const conflictClause =
      this.rejectDuplicateOnInsert && this.originalData === undefined
        ? ""
        : `ON CONFLICT ("id") DO UPDATE SET ${conflictAction}`;

    const query = `
  INSERT INTO "${this.tableName}" (${columns})
  VALUES (${placeholders})
  ${conflictClause}
  RETURNING *
`;

    const result = await this.db.query<DbRow<TData, TId>>(query, values);
    const row = result.rows[0];

    if (!row) {
      throw new DbError(
        `No row returned after saving ${this.constructor.name}`,
        { source: "BaseModel", storeLog: true, tenant: this.getTenant() },
      );
    }

    const { id, ...payload } = row;

    this.id = id;
    this.data = this.validate(payload);
    this.originalData = structuredClone(this.data);
    return row;
  }
}
