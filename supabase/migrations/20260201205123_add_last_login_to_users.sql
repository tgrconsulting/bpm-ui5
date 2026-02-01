alter table "public"."tbl_users" add column "last_login" timestamp without time zone;

ALTER TABLE "public"."tbl_users"
ADD COLUMN "is_active" bool;
