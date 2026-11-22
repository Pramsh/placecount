import type { FastifyPluginAsync } from "fastify";
import { DbConnector } from "#shared";

export const databasePlugin: FastifyPluginAsync = async (app) => {
  const db = DbConnector.getInstance();

  await db.query("SELECT 1");

  app.decorate("db", db);

  app.log.info("Database connected");
};
