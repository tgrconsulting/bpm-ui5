'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// --- Types ---

export interface Process {
  process_id: string;
  description: string;
  group_id: string;
}

export type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

// --- Actions ---

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
    return { success: false, error: 'Failed to fetch Process.' };
  }
}

export async function ReadProcess(id: string): Promise<ActionResult<Process>> {
  try {
    const result = await query('SELECT * FROM tbl_processes WHERE process_id = $1', [id]);

    if (result.rows.length === 0) {
      return { success: false, error: 'Process not found.' };
    }

    return {
      success: true,
      data: result.rows[0] as Process,
    };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, error: 'Database error occurred while fetching Process.' };
  }
}

export async function CreateProcess(Process: Process): Promise<ActionResult> {
  try {
    const sql = `
      INSERT INTO tbl_processes (process_id, description)
      VALUES ($1, $2)
      ON CONFLICT (process_id) DO NOTHING
      RETURNING process_id
    `;

    const result = await query(sql, [Process.process_id.trim(), Process.description.trim()]);

    if (result.rows.length === 0) {
      return {
        success: false,
        error: `Process ID "${Process.process_id}" already exists.`,
      };
    }

    revalidatePath('/Process');
    return { success: true };
  } catch (error) {
    console.error('Failed to save:', error);
    return { success: false, error: 'Database error occurred while saving.' };
  }
}

export async function UpdateProcess(id: string, updates: Partial<Omit<Process, 'process_id'>>): Promise<ActionResult> {
  try {
    if (!updates.description) {
      return { success: false, error: 'No data provided for update.' };
    }

    const sql = `
      UPDATE tbl_processes
      SET description = $1
      WHERE process_id = $2
      RETURNING process_id
    `;

    const result = await query(sql, [updates.description.trim(), id]);

    if (result.rowCount === 0) {
      return {
        success: false,
        error: `Process with ID "${id}" not found.`,
      };
    }

    revalidatePath('/Process');
    // If you have a dynamic detail route, revalidate that as well:
    revalidatePath(`/Process/${id}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to update:', error);
    return { success: false, error: 'Database error occurred while updating.' };
  }
}

export async function DeleteProcess(id: string): Promise<ActionResult> {
  try {
    await query('DELETE FROM tbl_processes WHERE process_id = $1', [id]);

    revalidatePath('/Process');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete:', error);
    return { success: false, error: 'Database error occurred during deletion.' };
  }
}
