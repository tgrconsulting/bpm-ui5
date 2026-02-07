ALTER TABLE tbl_processes 
ADD COLUMN process_status varchar(1) 
CHECK (process_status IN ('A', 'I'));