'use client';

// ============================================================================
// Imports
// ============================================================================

import editIcon from '@ui5/webcomponents-icons/dist/edit.js';
import deleteIcon from '@ui5/webcomponents-icons/dist/delete.js';
import {
  Table,
  TableRow,
  TableCell,
  TableHeaderRow,
  TableHeaderCell,
  TableGrowing,
  TableRowAction,
  Label,
} from '@ui5/webcomponents-react';
import { useMemo, useState } from 'react';

import { Application } from './db-actions';

// ============================================================================
// Types
// ============================================================================

type SortOrder = 'Ascending' | 'Descending' | 'None';

interface SortConfig {
  column: keyof Application | null;
  order: SortOrder;
}

interface ApplicationsTableProps {
  data: Application[];
  hasMore: boolean;
  onLoadMore: (event: any) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// ============================================================================
// Component
// ============================================================================

export function ApplicationsTable({ data, hasMore, onLoadMore, onEdit, onDelete }: ApplicationsTableProps) {
  // --------------------------------------------------------------------------
  // State Management
  // --------------------------------------------------------------------------

  /**
   * Sorting configuration with initial sort on application_id ascending.
   */
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: 'application_id',
    order: 'Ascending',
  });

  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------

  /**
   * Handles sorting for a given column.
   * Toggles between Ascending/Descending for same column, defaults to Ascending for new columns.
   *
   * @param {keyof Application} column - The column to sort by
   * @returns {void}
   */
  const handleSort = (column: keyof Application) => {
    setSortConfig((prev) => {
      if (prev.column === column) {
        return {
          column,
          order: prev.order === 'Ascending' ? 'Descending' : 'Ascending',
        };
      }
      return { column, order: 'Ascending' };
    });
  };

  // --------------------------------------------------------------------------
  // Computed Values
  // --------------------------------------------------------------------------

  /**
   * Sorts the data based on current sort configuration.
   */
  const sortedData = useMemo(() => {
    if (!sortConfig.column || sortConfig.order === 'None') return data;

    return [...data].sort((a, b) => {
      const aValue = (a[sortConfig.column!] || '').toString().toLowerCase();
      const bValue = (b[sortConfig.column!] || '').toString().toLowerCase();

      if (aValue < bValue) return sortConfig.order === 'Ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.order === 'Ascending' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <Table
      style={{ height: '100%', width: '100%', minWidth: '100%' }}
      headerRow={
        <TableHeaderRow sticky>
          {/* Application ID Column */}
          <TableHeaderCell
            sortIndicator={sortConfig.column === 'application_id' ? sortConfig.order : 'None'}
            onClick={() => handleSort('application_id')}
          >
            <Label>Application</Label>
          </TableHeaderCell>

          {/* Description Column */}
          <TableHeaderCell
            sortIndicator={sortConfig.column === 'description' ? sortConfig.order : 'None'}
            onClick={() => handleSort('description')}
          >
            <Label>Description</Label>
          </TableHeaderCell>
        </TableHeaderRow>
      }
      features={
        hasMore ? (
          <TableGrowing
            text="Load More"
            onLoadMore={onLoadMore}
          />
        ) : undefined
      }
      rowActionCount={2}
    >
      {sortedData.map((row) => (
        <TableRow
          key={row.application_id}
          actions={
            <>
              <TableRowAction
                icon={editIcon}
                text="Edit"
                onClick={() => onEdit(row.application_id)}
              />
              <TableRowAction
                icon={deleteIcon}
                text="Delete"
                onClick={() => onDelete(row.application_id)}
              />
            </>
          }
        >
          <TableCell>
            <Label>{row.application_id}</Label>
          </TableCell>
          <TableCell>
            <Label>{row.description}</Label>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
