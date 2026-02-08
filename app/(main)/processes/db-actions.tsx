'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Group } from '../groups/db-actions';
import { Application } from '../applications/db-actions';

// --- Types ---

export interface Process {
  process_id: string;
  process_type: string;
  process_status: string;
  description: string;
  group_id: string;
  processItems?: ProcessEvent[];
  groups?: Group[];
  applications?: Application[];
}

export interface ProcessEvent {
  process_id: string;
  type: number;
  sequence: number;
  description: string;
  application_id: string;
  duration: number;
}

export type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

// --- Actions ---

/**
 * Fetches a list of processes for the overview table
 */
export async function ReadProcesses(
  offset: number,
  limit: number,
): Promise<ActionResult<{ Process: Process[]; hasMore: boolean }>> {
  try {
    const result = await query('SELECT * FROM tbl_processes ORDER BY process_id ASC LIMIT $1 OFFSET $2', [
      limit + 1,
      offset,
    ]);

    const hasMore = result.rows.length > limit;
    const rows = hasMore ? result.rows.slice(0, limit) : result.rows;

    return {
      success: true,
      data: {
        Process: rows as Process[],
        hasMore: hasMore,
      },
    };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, error: 'Failed to fetch Processes.' };
  }
}

/**
 * Fetches a single process AND the list of all available groups
 */
export async function ReadProcess(id: string): Promise<ActionResult<Process>> {
  try {
    const groupsResult = await query('SELECT * FROM tbl_groups ORDER BY group_id ASC', []);
    const availableGroups = groupsResult.rows as Group[];

    const applicationsResult = await query('SELECT * FROM tbl_applications ORDER BY application_id ASC', []);
    const availableApplications = applicationsResult.rows as Application[];

    if (!id || id === 'new') {
      return {
        success: true,
        data: {
          process_id: '',
          process_type: '',
          group_id: '',
          process_status: '',
          description: '',
          processItems: [],
          groups: availableGroups,
          applications: availableApplications,
        },
      };
    }

    const processResult = await query('SELECT * FROM tbl_processes WHERE process_id = $1', [id]);
    if (processResult.rows.length === 0) {
      return { success: false, error: 'Process not found.' };
    }

    const eventsResult = await query(
      'SELECT * FROM tbl_processevents WHERE process_id = $1 ORDER BY type ASC, sequence ASC',
      [id],
    );

    return {
      success: true,
      data: {
        ...(processResult.rows[0] as Process),
        processItems: eventsResult.rows as ProcessEvent[],
        groups: availableGroups,
        applications: availableApplications,
      },
    };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, error: 'Database error occurred while fetching Process.' };
  }
}

/**
 * Creates a new process record and its associated items as a single transaction
 */
export async function CreateProcess(process: Process): Promise<ActionResult> {
  try {
    await query('BEGIN', []);

    const processSql = `
      INSERT INTO tbl_processes (process_id, process_type, process_status, group_id,description)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (process_id) DO NOTHING
      RETURNING process_id
    `;
    const processResult = await query(processSql, [
      process.process_id.trim(),
      process.process_type.trim(),
      process.process_status.trim(),
      process.group_id.trim(),
      process.description.trim(),
    ]);

    if (processResult.rows.length === 0) {
      await query('ROLLBACK', []);
      return { success: false, error: `Process ID "${process.process_id}" already exists.` };
    }

    if (process.processItems && process.processItems.length > 0) {
      for (const pi of process.processItems) {
        await query(
          'INSERT INTO tbl_processevents (process_id, type, sequence, description, application_id, duration) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            process.process_id.trim(),
            pi.type,
            pi.sequence,
            pi.description.trim(),
            pi.application_id.trim(),
            pi.duration,
          ],
        );
      }
    }

    await query('COMMIT', []);
    revalidatePath('/Process');
    return { success: true };
  } catch (error) {
    await query('ROLLBACK', []);
    console.error('Failed to create process:', error);
    return { success: false, error: 'Database error occurred while saving.' };
  }
}

/**
 * Updates an existing process record and refreshes its item list as a transaction
 */
export async function UpdateProcess(id: string, process: Process): Promise<ActionResult> {
  try {
    await query('BEGIN', []);

    // 1. Update Parent
    const updateSql = `
      UPDATE tbl_processes
      SET process_type = $2, process_status = $3, group_id = $4, description = $5
      WHERE process_id = $1
      RETURNING process_id
    `;
    const result = await query(updateSql, [
      id,
      process.process_type.trim(),
      process.process_status.trim(),
      process.group_id.trim(),
      process.description.trim(),
    ]);

    if (result.rowCount === 0) {
      await query('ROLLBACK', []);
      return { success: false, error: `Process with ID "${id}" not found.` };
    }

    // 2. Refresh items: Delete existing and re-insert new ones
    await query('DELETE FROM tbl_processevents WHERE process_id = $1', [id]);

    if (process.processItems && process.processItems.length > 0) {
      for (const pi of process.processItems) {
        await query(
          'INSERT INTO tbl_processevents (process_id, type, sequence, description, application_id, duration) VALUES ($1, $2, $3, $4, $5, $6)',
          [id, pi.type, pi.sequence, pi.description.trim(), pi.application_id.trim(), pi.duration],
        );
      }
    }

    await query('COMMIT', []);
    revalidatePath('/Process');
    revalidatePath(`/Process/${id}`);
    return { success: true };
  } catch (error) {
    await query('ROLLBACK', []);
    console.error('Failed to update process:', error);
    return { success: false, error: 'Database error occurred while updating.' };
  }
}

/**
 * Deletes a process record and its items as a transaction
 */
export async function DeleteProcess(id: string): Promise<ActionResult> {
  try {
    await query('BEGIN', []);
    await query('DELETE FROM tbl_processevents WHERE process_id = $1', [id]);
    const result = await query('DELETE FROM tbl_processes WHERE process_id = $1 RETURNING process_id', [id]);

    if (result.rowCount === 0) {
      await query('ROLLBACK', []);
      return { success: false, error: 'Process not found or already deleted.' };
    }

    await query('COMMIT', []);
    revalidatePath('/Process');
    return { success: true };
  } catch (error) {
    await query('ROLLBACK', []);
    console.error('Failed to delete process:', error);
    return { success: false, error: 'Database error occurred during deletion.' };
  }
}
