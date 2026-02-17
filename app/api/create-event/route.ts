// =============================================================================
// Imports
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';

// =============================================================================
// Schema Definition
// =============================================================================

export const CreateEventSchema = z.object({
    process_id: z.string().min(1, "process_id is mandatory"),
    application_id: z.string().min(1, "application_id is mandatory"),
    event_type: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z.number({ message: "event_type is mandatory" })
    ),
    sequence: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z.number({ message: "sequence is mandatory" })
    ),
    event_key: z.string().min(1, "event_key is mandatory"),
    predecessor_key: z.string().optional(),
    status: z.string().refine((val) => val === "E" || val === "S", {
        message: "status must be either 'E' or 'S'",
    }),
    message: z.string().min(1, "message is mandatory"),
});

export type EventPayload = z.infer<typeof CreateEventSchema>;

// =============================================================================
// API Handler
// =============================================================================

export async function POST(request: NextRequest) {
    try {
        // 1. API Key Validation
        const apiKey = request.headers.get('x-api-key');

        if (!apiKey) {
            return NextResponse.json({ error: 'API Key is missing' }, { status: 401 });
        }

        const orgResult = await query(
            'SELECT tenant_id FROM tbl_organisations WHERE api_key = $1 AND is_active = true',
            [apiKey]
        );

        if (orgResult.rowCount === 0) {
            return NextResponse.json({ error: 'Unauthorized: Invalid or inactive API Key' }, { status: 401 });
        }

        const tenantId = orgResult.rows[0].tenant_id;

        // 2. Body Parsing & Validation (Zod)
        const body = await request.json();
        const validation = CreateEventSchema.safeParse(body);

        if (!validation.success) {
            const fieldErrors = validation.error.issues.reduce((acc: Record<string, string>, issue) => {
                const path = issue.path[0] as string;
                acc[path] = issue.message;
                return acc;
            }, {});

            return NextResponse.json(
                { error: 'Validation failed', details: fieldErrors },
                { status: 400 }
            );
        }

        const data = validation.data;

        // 3. Database logic (Injecting tenantId)
        const sql = `
            INSERT INTO tbl_eventqueue (
                tenant_id,
                process_id, 
                application_id,
                event_type, 
                sequence, 
                event_key, 
                predecessor_key, 
                status, 
                message
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING guid;
        `;

        const values = [
            tenantId, // Automatically derived from API key
            data.process_id,
            data.application_id,
            data.event_type,
            data.sequence,
            data.event_key,
            data.predecessor_key || null,
            data.status,
            data.message
        ];

        const result = await query(sql, values);
        const newEvent = result.rows[0];

        return NextResponse.json(
            { message: 'Event created', guid: newEvent.guid, tenant: tenantId },
            { status: 201 }
        );

    } catch (error: any) {
        // Handle Foreign Key Violations (Postgres Error Code 23503)
        if (error.code === '23503') {
            const constraintMapping: Record<string, { field: string, msg: string }> = {
                'fk_event_process': {
                    field: 'process_id',
                    msg: 'The provided process_id does not exist.'
                },
                'fk_event_application': {
                    field: 'application_id',
                    msg: 'The provided application_id does not exist.'
                },
                'fk_process_event_combination': {
                    field: 'process_config',
                    msg: 'The combination of process_id, event_type, and sequence is not defined in the process configuration.'
                }
            };

            const violation = constraintMapping[error.constraint];
            const targetField = violation?.field || 'database_reference';
            const errorMsg = violation?.msg || 'Reference validation failed.';

            return NextResponse.json(
                {
                    error: 'Reference Validation Failed',
                    details: { [targetField]: errorMsg }
                },
                { status: 400 }
            );
        }

        console.error('Database Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}



