ALTER TABLE tbl_eventqueue
    ADD COLUMN created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN process_status VARCHAR(20) DEFAULT 'new';

ALTER TABLE tbl_eventqueue DROP CONSTRAINT IF EXISTS fk_application;

ALTER TABLE tbl_eventqueue DROP CONSTRAINT IF EXISTS fk_process;  

ALTER TABLE tbl_eventqueue 
    ADD CONSTRAINT fk_event_process 
    FOREIGN KEY (process_id) REFERENCES tbl_processes(process_id);

ALTER TABLE tbl_eventqueue 
    ADD CONSTRAINT fk_event_application 
    FOREIGN KEY (application_id) REFERENCES tbl_applications(application_id);

ALTER TABLE tbl_eventqueue
    ADD CONSTRAINT fk_process_event_combination 
    FOREIGN KEY (process_id, event_type, sequence) 
    REFERENCES tbl_processevents(process_id, event_type, sequence);  

CREATE TABLE tbl_organisations (
    id SERIAL PRIMARY KEY,
    org_name VARCHAR(100) NOT NULL,
    tenant_id VARCHAR(50) UNIQUE NOT NULL, 
    api_key UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);       

ALTER TABLE tbl_eventqueue 
ADD COLUMN tenant_id VARCHAR(50) NOT NULL 
CONSTRAINT fk_event_tenant REFERENCES tbl_organisations(tenant_id);