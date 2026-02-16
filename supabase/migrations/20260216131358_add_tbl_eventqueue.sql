CREATE TABLE tbl_eventqueue (
    guid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id VARCHAR(20),
    event_type INT4 CHECK (event_type IN (1, 2, 3)),
    sequence INT4,
    application_id VARCHAR(20),
    status VARCHAR(1) CHECK (status IN ('E', 'S')),
    event_key VARCHAR(128),
    predecessor_key VARCHAR(128),
    message VARCHAR(128)
);
ALTER TABLE "public"."tbl_processevents" RENAME COLUMN "type" TO "event_type";ALTER TABLE "public"."tbl_processevents" RENAME COLUMN "type" TO "event_type";