-- This file runs once when the Postgres container is first created.
-- SQLAlchemy will create the tables; we add extra indexes + optional seed data here.

-- Wait for tables to be created by the app before inserting seed data.
-- The seed INSERT statements are wrapped in DO blocks so they run safely.

DO $$
BEGIN
  -- Nothing to do on first boot; tables are created by SQLAlchemy.
  -- Seed data can be added here after the first `docker compose up`.
  RAISE NOTICE 'PostgreSQL initialised for InventIQ';
END $$;
