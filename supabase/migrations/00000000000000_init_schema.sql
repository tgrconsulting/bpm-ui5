-- 1. BASIC SETTINGS
SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET row_security = off;

-- 2. SCHEMA SETUP
CREATE SCHEMA IF NOT EXISTS "public";
COMMENT ON SCHEMA "public" IS 'standard public schema';

-- 3. TABLES
CREATE TABLE IF NOT EXISTS "public"."tbl_applications" (
    "application_id" varchar(20) PRIMARY KEY,
    "description" varchar(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."tbl_groups" (
    "group_id" varchar(20) PRIMARY KEY,
    "description" varchar(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."tbl_processes" (
    "process_id" varchar(20) PRIMARY KEY,
    "description" varchar(100),
    "group_id" varchar(20) REFERENCES "public"."tbl_groups"("group_id"),
    "process_type" varchar(1) CHECK (process_type IN ('S', 'D', 'B'))
);

CREATE TABLE IF NOT EXISTS "public"."tbl_processevents" (
    "process_id" varchar(20) REFERENCES "public"."tbl_processes"("process_id"),
    "sequence" integer NOT NULL,
    "description" varchar(100),
    "type" integer NOT NULL,
    "application_id" varchar(20) REFERENCES "public"."tbl_applications"("application_id"),
    PRIMARY KEY ("process_id", "type", "sequence")
);

CREATE TABLE IF NOT EXISTS "public"."tbl_users" (
    "user_id" SERIAL PRIMARY KEY,
    "email" varchar(255) UNIQUE NOT NULL,
    "name" varchar(100) NOT NULL,
    "company" varchar(150),
    "is_active" boolean DEFAULT true
);

-- 4. PERMISSIONS (Supabase Standard Roles)
GRANT USAGE ON SCHEMA "public" TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA "public" TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA "public" TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA "public" TO postgres, anon, authenticated, service_role;






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







