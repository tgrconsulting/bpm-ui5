ALTER TABLE tbl_processevents 
ADD COLUMN duration integer;

ALTER TABLE "public"."tbl_processevents" ALTER COLUMN "application_id" SET NOT NULL;
ALTER TABLE "public"."tbl_processevents" ALTER COLUMN "description" SET NOT NULL;
ALTER TABLE "public"."tbl_processevents" ALTER COLUMN "duration" SET NOT NULL;