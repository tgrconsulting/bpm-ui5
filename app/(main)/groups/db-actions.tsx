'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// --- Types ---

export interface Group {
  group_id: string;
  description: string;
}

export type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

// --- Actions ---

export async function ReadGroups(
  offset: number,
  limit: number,
): Promise<ActionResult<{ Groups: Group[]; hasMore: boolean }>> {
  try {
    const result = await query(
      'SELECT group_id, description FROM tbl_groups ORDER BY group_id ASC LIMIT $1 OFFSET $2',
      [limit + 1, offset],
    );

    const hasMore = result.rows.length > limit;
    const rows = hasMore ? result.rows.slice(0, limit) : result.rows;

    return {
      success: true,
      data: {
        Groups: rows as Group[],
        hasMore: hasMore,
      },
    };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, error: 'Failed to fetch Groups.' };
  }
}

export async function ReadGroup(id: string): Promise<ActionResult<Group>> {
  try {
    const result = await query('SELECT group_id, description FROM tbl_groups WHERE group_id = $1', [id]);

    if (result.rows.length === 0) {
      return { success: false, error: 'Group not found.' };
    }

    return {
      success: true,
      data: result.rows[0] as Group,
    };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, error: 'Database error occurred while fetching Group.' };
  }
}

export async function CreateGroup(Group: Group): Promise<ActionResult> {
  try {
    const sql = `
      INSERT INTO tbl_groups (group_id, description)
      VALUES ($1, $2)
      ON CONFLICT (group_id) DO NOTHING
      RETURNING group_id
    `;

    const result = await query(sql, [Group.group_id.trim(), Group.description.trim()]);

    if (result.rows.length === 0) {
      return {
        success: false,
        error: `Group ID "${Group.group_id}" already exists.`,
      };
    }

    revalidatePath('/Groups');
    return { success: true };
  } catch (error) {
    console.error('Failed to save:', error);
    return { success: false, error: 'Database error occurred while saving.' };
  }
}

export async function UpdateGroup(id: string, updates: Partial<Omit<Group, 'group_id'>>): Promise<ActionResult> {
  try {
    if (!updates.description) {
      return { success: false, error: 'No data provided for update.' };
    }

    const sql = `
      UPDATE tbl_groups
      SET description = $1
      WHERE group_id = $2
      RETURNING group_id
    `;

    const result = await query(sql, [updates.description.trim(), id]);

    if (result.rowCount === 0) {
      return {
        success: false,
        error: `Group with ID "${id}" not found.`,
      };
    }

    revalidatePath('/Groups');
    // If you have a dynamic detail route, revalidate that as well:
    revalidatePath(`/Groups/${id}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to update:', error);
    return { success: false, error: 'Database error occurred while updating.' };
  }
}

export async function DeleteGroup(id: string): Promise<ActionResult> {
  try {
    // 1. Check if any process is currently using this group_id
    const checkResult = await query('SELECT process_id FROM tbl_processes WHERE group_id = $1 LIMIT 1', [id]);

    if (checkResult.rowCount && checkResult.rowCount > 0) {
      const processId = checkResult.rows[0].process_id;
      return {
        success: false,
        error: `Cannot delete Group "${id}" because it is still being used by at least one process (e.g., Process: ${processId}).`,
      };
    }

    // 2. Proceed with deletion if no references found
    const deleteResult = await query('DELETE FROM tbl_groups WHERE group_id = $1 RETURNING group_id', [id]);

    if (deleteResult.rowCount === 0) {
      return {
        success: false,
        error: `Group with ID "${id}" not found or already deleted.`,
      };
    }

    revalidatePath('/Groups');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete:', error);
    return {
      success: false,
      error: 'A database error occurred during deletion. Please ensure no other records depend on this group.',
    };
  }
}
