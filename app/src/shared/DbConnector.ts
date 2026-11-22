import "dotenv/config";
import { Pool } from "pg";
import type { QueryResult, QueryResultRow } from "pg";
import fastifyPlugin from "fastify-plugin";

export class DbConnector {
  private static instance: DbConnector;
  private readonly pool: Pool;

  private constructor() {
    this.pool = new Pool({
      host: process.env.POSTGRES_HOST ?? "localhost",
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      database: process.env.POSTGRES_DATABASE ?? "placecount_test_run",
      user: process.env.POSTGRES_USER ?? "placecount_test",
      password: process.env.POSTGRES_PASSWORD,
      max: Number(process.env.POSTGRES_POOL_MAX ?? 10),
      connectionTimeoutMillis: 5000,
    });
  }

  public static getInstance(): DbConnector {
    if (!DbConnector.instance) {
      DbConnector.instance = new DbConnector();
    }

    return DbConnector.instance;
  }

  public query<T extends QueryResultRow = QueryResultRow>(
    queryString: string,
    values?: any[],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(queryString, values);
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}
