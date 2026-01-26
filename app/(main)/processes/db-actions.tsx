'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Group } from '../groups/db-actions';

// --- Types ---

export interface Process {
  process_id: string;
  description: string;
  group_id: string;
  groups?: Group[]; // Hold the dropdown source data
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
 * for the ComboBox source.
 */
export async function ReadProcess(id: string): Promise<ActionResult<Process>> {
  try {
    // 1. Fetch all groups for the dropdown source (needed for both New and Edit)
    const groupsResult = await query('SELECT group_id, description FROM tbl_groups ORDER BY group_id ASC', []);
    const availableGroups = groupsResult.rows as Group[];

    // 2. If ID is empty or 'new', return empty structure with groups
    if (!id || id === 'new') {
      return {
        success: true,
        data: {
          process_id: '',
          description: '',
          group_id: '',
          groups: availableGroups,
        },
      };
    }

    // 3. Fetch specific process
    const result = await query('SELECT * FROM tbl_processes WHERE process_id = $1', [id]);

    if (result.rows.length === 0) {
      return { success: false, error: 'Process not found.' };
    }

    const processData = result.rows[0] as Process;

    return {
      success: true,
      data: {
        ...processData,
        groups: availableGroups, // Attach the dropdown options
      },
    };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, error: 'Database error occurred while fetching Process.' };
  }
}

/**
 * Creates a new process record
 */
export async function CreateProcess(process: Process): Promise<ActionResult> {
  try {
    const sql = `
      INSERT INTO tbl_processes (process_id, description, group_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (process_id) DO NOTHING
      RETURNING process_id
    `;

    const result = await query(sql, [process.process_id.trim(), process.description.trim(), process.group_id.trim()]);

    if (result.rows.length === 0) {
      return {
        success: false,
        error: `Process ID "${process.process_id}" already exists.`,
      };
    }

    revalidatePath('/Process');
    return { success: true };
  } catch (error) {
    console.error('Failed to save:', error);
    return { success: false, error: 'Database error occurred while saving.' };
  }
}

/**
 * Updates an existing process record
 */
export async function UpdateProcess(
  id: string,
  updates: Partial<Omit<Process, 'process_id' | 'groups'>>,
): Promise<ActionResult> {
  try {
    if (!updates.description || !updates.group_id) {
      return { success: false, error: 'Description and Group are required fields.' };
    }

    const sql = `
      UPDATE tbl_processes
      SET description = $1, group_id = $2
      WHERE process_id = $3
      RETURNING process_id
    `;

    const result = await query(sql, [updates.description.trim(), updates.group_id.trim(), id]);

    if (result.rowCount === 0) {
      return { success: false, error: `Process with ID "${id}" not found.` };
    }

    revalidatePath('/Process');
    revalidatePath(`/Process/${id}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to update:', error);
    return { success: false, error: 'Database error occurred while updating.' };
  }
}

/**
 * Deletes a process record
 */
export async function DeleteProcess(id: string): Promise<ActionResult> {
  try {
    const result = await query('DELETE FROM tbl_processes WHERE process_id = $1 RETURNING process_id', [id]);

    if (result.rowCount === 0) {
      return { success: false, error: 'Process not found or already deleted.' };
    }

    revalidatePath('/Process');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete:', error);
    return { success: false, error: 'Database error occurred during deletion.' };
  }
}
