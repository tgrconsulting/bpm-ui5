drop extension if exists "pg_net";

drop extension if exists "pg_stat_statements";

drop extension if exists "pgcrypto";

drop extension if exists "uuid-ossp";

create sequence "public"."tbl_users_user_id_seq";


  create table "public"."tbl_applications" (
    "application_id" character varying(20) not null,
    "description" character varying(100) not null
      );



  create table "public"."tbl_groups" (
    "group_id" character varying(20) not null,
    "description" character varying(100) not null
      );



  create table "public"."tbl_processes" (
    "process_id" character varying(20) not null,
    "description" character varying(100) not null,
    "group_id" character varying(20) not null,
    "process_type" character varying(1) not null
      );



  create table "public"."tbl_processevents" (
    "process_id" character varying(20) not null,
    "sequence" integer not null,
    "description" character varying(100),
    "type" integer not null,
    "application_id" character varying(20) not null
      );



  create table "public"."tbl_users" (
    "user_id" integer not null default nextval('public.tbl_users_user_id_seq'::regclass),
    "email" character varying(255) not null,
    "name" character varying(100) not null,
    "company" character varying(150)
      );


alter sequence "public"."tbl_users_user_id_seq" owned by "public"."tbl_users"."user_id";

CREATE UNIQUE INDEX tbl_groups_pkey ON public.tbl_groups USING btree (group_id);

CREATE UNIQUE INDEX tbl_processes_pkey ON public.tbl_processes USING btree (process_id);

CREATE UNIQUE INDEX tbl_processitems_pkey ON public.tbl_processevents USING btree (process_id, type, sequence);

CREATE UNIQUE INDEX tbl_users_email_key ON public.tbl_users USING btree (email);

CREATE UNIQUE INDEX tbl_users_pkey ON public.tbl_users USING btree (user_id);

CREATE UNIQUE INDEX tblapplications_pkey ON public.tbl_applications USING btree (application_id);

alter table "public"."tbl_applications" add constraint "tblapplications_pkey" PRIMARY KEY using index "tblapplications_pkey";

alter table "public"."tbl_groups" add constraint "tbl_groups_pkey" PRIMARY KEY using index "tbl_groups_pkey";

alter table "public"."tbl_processes" add constraint "tbl_processes_pkey" PRIMARY KEY using index "tbl_processes_pkey";

alter table "public"."tbl_processevents" add constraint "tbl_processitems_pkey" PRIMARY KEY using index "tbl_processitems_pkey";

alter table "public"."tbl_users" add constraint "tbl_users_pkey" PRIMARY KEY using index "tbl_users_pkey";

alter table "public"."tbl_processes" add constraint "fk_group" FOREIGN KEY (group_id) REFERENCES public.tbl_groups(group_id) not valid;

alter table "public"."tbl_processes" validate constraint "fk_group";

alter table "public"."tbl_processes" add constraint "process_type_check" CHECK (((process_type)::text = ANY ((ARRAY['S'::character varying, 'D'::character varying])::text[]))) not valid;

alter table "public"."tbl_processes" validate constraint "process_type_check";

alter table "public"."tbl_processevents" add constraint "fk_process" FOREIGN KEY (process_id) REFERENCES public.tbl_processes(process_id) not valid;

alter table "public"."tbl_processevents" validate constraint "fk_process";

alter table "public"."tbl_processevents" add constraint "fk_processitems_application" FOREIGN KEY (application_id) REFERENCES public.tbl_applications(application_id) not valid;

alter table "public"."tbl_processevents" validate constraint "fk_processitems_application";

alter table "public"."tbl_processevents" add constraint "tbl_processitems_type_check" CHECK ((type = ANY (ARRAY[1, 2, 3]))) not valid;

alter table "public"."tbl_processevents" validate constraint "tbl_processitems_type_check";

alter table "public"."tbl_users" add constraint "tbl_users_email_key" UNIQUE using index "tbl_users_email_key";

drop trigger if exists "tr_check_filters" on "realtime"."subscription";

drop trigger if exists "enforce_bucket_name_length_trigger" on "storage"."buckets";

drop trigger if exists "update_objects_updated_at" on "storage"."objects";


