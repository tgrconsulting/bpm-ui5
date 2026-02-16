ALTER TABLE "public"."tbl_processevents" ALTER COLUMN "process_id" SET DATA TYPE varchar(30);
ALTER TABLE "public"."tbl_processevents" ALTER COLUMN "application_id" SET DATA TYPE varchar(30);
ALTER TABLE "public"."tbl_processes" ALTER COLUMN "process_id" SET DATA TYPE varchar(30);
ALTER TABLE "public"."tbl_processes" ALTER COLUMN "group_id" SET DATA TYPE varchar(30);
ALTER TABLE "public"."tbl_groups" ALTER COLUMN "group_id" SET DATA TYPE varchar(30);
ALTER TABLE "public"."tbl_applications" ALTER COLUMN "application_id" SET DATA TYPE varchar(30);