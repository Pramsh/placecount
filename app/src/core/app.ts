import Fastify from "fastify";

const app = Fastify({ logger: true });

export const logger = app.log;
export { app };
