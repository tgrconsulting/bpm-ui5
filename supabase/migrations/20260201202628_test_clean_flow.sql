alter table "public"."tbl_users" drop column "is_active";

alter table "public"."tbl_users" add column "is_active_user" boolean default true;


