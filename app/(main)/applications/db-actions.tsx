'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// --- Types ---

export interface Application {
  application_id: string;
  description: string;
}

export type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

// --- Actions ---

export async function ReadApplications(
  offset: number,
  limit: number,
): Promise<ActionResult<{ applications: Application[]; hasMore: boolean }>> {
  try {
    const result = await query(
      'SELECT application_id, description FROM tbl_applications ORDER BY application_id ASC LIMIT $1 OFFSET $2',
      [limit + 1, offset],
    );

    const hasMore = result.rows.length > limit;
    const rows = hasMore ? result.rows.slice(0, limit) : result.rows;

    return {
      success: true,
      data: {
        applications: rows as Application[],
        hasMore: hasMore,
      },
    };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, error: 'Failed to fetch applications.' };
  }
}

export async function ReadApplication(id: string): Promise<ActionResult<Application>> {
  try {
    const result = await query('SELECT application_id, description FROM tbl_applications WHERE application_id = $1', [
      id,
    ]);

    if (result.rows.length === 0) {
      return { success: false, error: 'Application not found.' };
    }

    return {
      success: true,
      data: result.rows[0] as Application,
    };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, error: 'Database error occurred while fetching application.' };
  }
}

export async function CreateApplication(application: Application): Promise<ActionResult> {
  try {
    const sql = `
      INSERT INTO tbl_applications (application_id, description)
      VALUES ($1, $2)
      ON CONFLICT (application_id) DO NOTHING
      RETURNING application_id
    `;

    const result = await query(sql, [application.application_id.trim(), application.description.trim()]);

    if (result.rows.length === 0) {
      return {
        success: false,
        error: `Application ID "${application.application_id}" already exists.`,
      };
    }

    revalidatePath('/applications');
    return { success: true };
  } catch (error) {
    console.error('Failed to save:', error);
    return { success: false, error: 'Database error occurred while saving.' };
  }
}

export async function UpdateApplication(
  id: string,
  updates: Partial<Omit<Application, 'application_id'>>,
): Promise<ActionResult> {
  try {
    if (!updates.description) {
      return { success: false, error: 'No data provided for update.' };
    }

    const sql = `
      UPDATE tbl_applications
      SET description = $1
      WHERE application_id = $2
      RETURNING application_id
    `;

    const result = await query(sql, [updates.description.trim(), id]);

    if (result.rowCount === 0) {
      return {
        success: false,
        error: `Application with ID "${id}" not found.`,
      };
    }

    revalidatePath('/applications');
    // If you have a dynamic detail route, revalidate that as well:
    revalidatePath(`/applications/${id}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to update:', error);
    return { success: false, error: 'Database error occurred while updating.' };
  }
}

export async function DeleteApplication(id: string): Promise<ActionResult> {
  try {
    await query('DELETE FROM tbl_applications WHERE application_id = $1', [id]);

    revalidatePath('/applications');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete:', error);
    return { success: false, error: 'Database error occurred during deletion.' };
  }
}
