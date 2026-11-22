import { DbConnector } from "#shared";
import { app } from "./app.ts";
import { databasePlugin } from "./plugins/index.ts";
type HealthResponse = {
  status: "ok" | "error";
  database: "connected" | "unavailable";
};

const port = Number(process.env.PORT || 3000);
app.register(databasePlugin);

app.addHook("onClose", async () => {
  await DbConnector.getInstance().getPool().end();
});

let shuttingDown = false;

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;

  try {
    await app.close();
  } catch (error) {
    app.log.error(error);
    process.exitCode = 1;
  }
}

process.once("SIGTERM", () => {
  void shutdown();
});

process.once("SIGINT", () => {
  void shutdown();
});

app.get("/health", async (_request, reply) => {
  try {
    await DbConnector.getInstance().query("SELECT 1");

    const result: HealthResponse = {
      status: "ok",
      database: "connected",
    };

    return reply.send(result);
  } catch {
    const result: HealthResponse = {
      status: "error",
      database: "unavailable",
    };

    return reply.code(503).send(result);
  }
});

try {
  await app.listen({ host: "0.0.0.0", port });
} catch (error) {
  app.log.error(error);
  await shutdown();
  process.exitCode = 1;
}
