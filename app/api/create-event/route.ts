// =============================================================================
// Imports
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// =============================================================================
// Components
// =============================================================================

export const CreateEventSchema = z.object({
    process_id: z.string().min(1, "process_id is mandatory"),
    key: z.string().min(1, "key is mandatory"),
    status: z.string().min(1, "status is mandatory"),
    message: z.string().min(1, "message is mandatory"),

    type: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z.number({ message: "type is mandatory" })
    ),

    sequence: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z.number({ message: "sequence is mandatory" })
    ),

    predecessor: z.string().optional(),
});

export type EventPayload = z.infer<typeof CreateEventSchema>;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate the payload
        const validation = CreateEventSchema.safeParse(body);

        if (!validation.success) {
            // Map the raw issues into a simple key-value object
            const fieldErrors = validation.error.issues.reduce((acc: Record<string, string>, issue) => {
                const path = issue.path[0] as string;
                acc[path] = issue.message;
                return acc;
            }, {});

            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: fieldErrors
                },
                { status: 400 }
            );
        }

        // Now 'data' is fully typed and validated
        const { process_id, type, sequence, key, status, message } = validation.data;

        // Database logic here...
        console.log('Valid Payload:', validation.data);

        return NextResponse.json({ message: 'Event created' }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
