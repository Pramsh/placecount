import type { QueryResultRow } from "pg";

export type DbRow<TData extends QueryResultRow, TId = string> = TData & {
  id: TId;
};
