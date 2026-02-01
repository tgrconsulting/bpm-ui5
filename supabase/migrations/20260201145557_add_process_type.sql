-- 1. Add the column safely
ALTER TABLE "public"."tbl_processes" 
ADD COLUMN IF NOT EXISTS "process_type" varchar(1);

-- 2. Drop the constraint if it exists (prevents "already exists" errors) 
-- and then recreate it to ensure it is active.
ALTER TABLE "public"."tbl_processes" 
DROP CONSTRAINT IF EXISTS "process_type_check";

ALTER TABLE "public"."tbl_processes" 
ADD CONSTRAINT "process_type_check" 
CHECK (process_type IN ('S', 'D'));
