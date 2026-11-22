-- Canonical schema and seed data for the persistent test/dev database.
-- Add tables and additive schema changes here. For hand-written records, use
-- INSERT ... ON CONFLICT DO NOTHING so reset, test setup and export are repeatable.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.tenants (
    id text PRIMARY KEY,
    "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant text NOT NULL REFERENCES public.tenants(id),
    "timestamp" timestamptz NOT NULL,
    source text NOT NULL,
    severity text NOT NULL,
    message text NOT NULL,
    context jsonb
);

CREATE TABLE IF NOT EXISTS public.presences (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tenant text NOT NULL REFERENCES public.tenants(id),
    "userUID" text NOT NULL,
    enter timestamptz NOT NULL,
    exit timestamptz NOT NULL,
    "createdAt" timestamptz NOT NULL
);

-- Additive upgrades for an existing database. Add new columns here using
-- ALTER TABLE ... ADD COLUMN IF aNOT EXISTS; backfill before making them NOT NULL.
ALTER TABLE public.tenants
    ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'it',
    ADD COLUMN IF NOT EXISTS "createdAt" timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.logs
    ADD COLUMN IF NOT EXISTS tenant text REFERENCES public.tenants(id),
    ADD COLUMN IF NOT EXISTS "timestamp" timestamptz,
    ADD COLUMN IF NOT EXISTS source text,
    ADD COLUMN IF NOT EXISTS severity text,
    ADD COLUMN IF NOT EXISTS message text,
    ADD COLUMN IF NOT EXISTS context jsonb;

ALTER TABLE public.presences
    ADD COLUMN IF NOT EXISTS tenant text REFERENCES public.tenants(id),
    ADD COLUMN IF NOT EXISTS "userUID" text,
    ADD COLUMN IF NOT EXISTS enter timestamptz,
    ADD COLUMN IF NOT EXISTS exit timestamptz,
    ADD COLUMN IF NOT EXISTS "createdAt" timestamptz;

-- Hand-authored initial data. Put additional INSERT statements below.
INSERT INTO public.tenants (id) VALUES
    ('swimmingpool1'),
    ('gym123')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.logs (id, tenant, "timestamp", source, severity, message, context) VALUES
    ('7079e0d9-ea40-4f19-8239-7024182df0e1', 'swimmingpool1', '2025-01-15 09:00:00+00', 'test-seed', 'info', 'Baseline test log', '{"fixture": true}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.presences (id, tenant, "userUID", enter, exit, "createdAt") VALUES
    ('21c272a4-7d6e-4ef4-914e-069fc306abaf', 'swimmingpool1', '542354', '2025-01-15 09:00:00+00', '2025-01-15 19:00:00+00', '2025-01-15 09:00:00+00'),
    ('0e8de1eb-2248-483f-b1dd-32e35502de89', 'swimmingpool1', '542354', '2025-01-15 09:00:00+00', '2025-01-14 19:00:00+00', '2025-01-15 09:00:00+00')
ON CONFLICT (id) DO NOTHING;







-- BEGIN EXPORTED DATABASE ROWS (generated) --
--
-- PostgreSQL database dump
--

\restrict r6CCEfHnQeJko8pPrG4WlINC3xRyPEstfV4XApZSjhyU46WeDzrTbDmXteIRnHd

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tenants (id, "createdAt") VALUES ('swimmingpool1', '2026-11-10 23:06:23.36782+00') ON CONFLICT DO NOTHING;
INSERT INTO public.tenants (id, "createdAt") VALUES ('gym123', '2026-11-10 23:06:23.36782+00') ON CONFLICT DO NOTHING;
INSERT INTO public.tenants (id, "createdAt") VALUES ('export-check-tenant', '2026-11-10 22:54:55.030929+00') ON CONFLICT DO NOTHING;
INSERT INTO public.tenants (id, "createdAt") VALUES ('temp-export-check', '2026-11-10 23:01:30.717679+00') ON CONFLICT DO NOTHING;
INSERT INTO public.tenants (id, "createdAt") VALUES ('shared-temp-check', '2026-11-10 23:03:05.755474+00') ON CONFLICT DO NOTHING;
INSERT INTO public.tenants (id, "createdAt") VALUES ('same-db-final-check', '2026-11-10 23:04:08.502426+00') ON CONFLICT DO NOTHING;
INSERT INTO public.tenants (id, "createdAt") VALUES ('dev-only-record', '2026-11-10 23:06:31.534877+00') ON CONFLICT DO NOTHING;


--
-- Data for Name: logs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.logs (id, tenant, "timestamp", source, severity, message, context) VALUES ('7079e0d9-ea40-4f19-8239-7024182df0e1', 'swimmingpool1', '2025-01-15 09:00:00+00', 'test-seed', 'info', 'Baseline test log', '{"fixture": true}') ON CONFLICT DO NOTHING;
INSERT INTO public.logs (id, tenant, "timestamp", source, severity, message, context) VALUES ('d8cc1f19-130b-4ffc-b16a-5cf7cd11788e', 'gym123', '2026-11-10 23:04:13.166+00', 'test', 'info', 'Creation of a new info log', '{"data": "ok"}') ON CONFLICT DO NOTHING;
INSERT INTO public.logs (id, tenant, "timestamp", source, severity, message, context) VALUES ('dcddc371-57a6-4ed5-b4e3-6aa4dfbbb9f3', 'gym123', '2026-11-10 23:04:13.173+00', 'test', 'debug', 'Creation of a new debug log', '{"data": {"data": "debug log"}}') ON CONFLICT DO NOTHING;
INSERT INTO public.logs (id, tenant, "timestamp", source, severity, message, context) VALUES ('7d1c4926-c08e-4426-91da-49ddc8a8cf43', 'gym123', '2026-11-10 23:04:13.174+00', 'test', 'warning', 'Creation of a new warning log', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.logs (id, tenant, "timestamp", source, severity, message, context) VALUES ('18fbb925-7b3b-4984-9231-d4b04e0c83d7', 'gym123', '2026-11-10 23:04:13.174+00', 'test', 'error', 'Creation of a new error log', '{"name": "Error", "stack": "Error: Error message for log\n    at TestContext.<anonymous> (file:///app/app/src/modules/logs/log.model.test.ts:60:29)\n    at Test.runInAsyncScope (node:async_hooks:227:14)\n    at Test.run (node:internal/test_runner/test:1402:25)\n    at Test.start (node:internal/test_runner/test:1262:17)\n    at node:internal/test_runner/test:1903:71\n    at node:internal/per_context/primordials:504:82\n    at new Promise (<anonymous>)\n    at new SafePromise (node:internal/per_context/primordials:478:3)\n    at node:internal/per_context/primordials:504:9\n    at Array.map (<anonymous>)", "message": "Error message for log"}') ON CONFLICT DO NOTHING;


--
-- Data for Name: presences; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.presences (id, tenant, "userUID", enter, exit, "createdAt") VALUES ('21c272a4-7d6e-4ef4-914e-069fc306abaf', 'swimmingpool1', '542354', '2025-01-15 09:00:00+00', '2025-01-15 19:00:00+00', '2025-01-15 09:00:00+00') ON CONFLICT DO NOTHING;
INSERT INTO public.presences (id, tenant, "userUID", enter, exit, "createdAt") VALUES ('0e8de1eb-2248-483f-b1dd-32e35502de89', 'swimmingpool1', '542354', '2025-01-15 09:00:00+00', '2025-01-14 19:00:00+00', '2025-01-15 09:00:00+00') ON CONFLICT DO NOTHING;


--
-- PostgreSQL database dump complete
--

\unrestrict r6CCEfHnQeJko8pPrG4WlINC3xRyPEstfV4XApZSjhyU46WeDzrTbDmXteIRnHd

-- END EXPORTED DATABASE ROWS (generated) --
