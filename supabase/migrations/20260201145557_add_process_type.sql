ALTER TABLE "public"."tbl_processes" 
ADD COLUMN "process_type" varchar(1);

-- Add a CHECK constraint to enforce only 'S' or 'D'
ALTER TABLE "public"."tbl_processes" 
ADD CONSTRAINT "process_type_check" 
CHECK (process_type IN ('S', 'D'));
ALTER TABLE "public"."tbl_processes" 
ADD COLUMN "process_type" varchar(1);
-- Add a CHECK constraint to enforce only 'S' or 'D'
ALTER TABLE "public"."tbl_processes" 
ADD CONSTRAINT "process_type_check" 
CHECK (process_type IN ('S', 'D'));
