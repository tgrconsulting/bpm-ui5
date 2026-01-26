'use client';

// =============================================================================
// Imports
// =============================================================================
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
import { Process } from './db-actions';

// =============================================================================
// Types & Constants
// =============================================================================
type SortOrder = 'Ascending' | 'Descending' | 'None';

interface SortConfig {
  column: keyof Process | null;
  order: SortOrder;
}

interface ProcesssTableProps {
  data: Process[];
  hasMore: boolean;
  onLoadMore: (event: any) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * ProcesssTable Component
 * Displays Process data with pre-configured initial sorting.
 */
export function ProcessesTable({ data, hasMore, onLoadMore, onEdit, onDelete }: ProcesssTableProps) {
  // ---------------------------------------------------------------------------
  // State Management
  // ---------------------------------------------------------------------------

  /**
   * INITIALIZATION: Set the default sort to 'Processid' / 'Ascending'
   * This ensures the sort indicator is visible on the first render.
   */
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: 'process_id',
    order: 'Ascending',
  });

  // ---------------------------------------------------------------------------
  // Logic Handlers
  // ---------------------------------------------------------------------------

  const handleSort = (column: keyof Process) => {
    setSortConfig((prev) => {
      // If clicking the same column, toggle between Ascending and Descending
      if (prev.column === column) {
        return {
          column,
          order: prev.order === 'Ascending' ? 'Descending' : 'Ascending',
        };
      }
      // If clicking a new column, default to Ascending
      return { column, order: 'Ascending' };
    });
  };

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

  // =============================================================================
  // Main Render
  // =============================================================================
  return (
    <Table
      style={{ height: '100%', width: '100%', minWidth: '100%' }}
      headerRow={
        <TableHeaderRow sticky>
          {/* Process ID Column */}
          <TableHeaderCell
            // Dynamically reflects the initial 'Ascending' state
            sortIndicator={sortConfig.column === 'process_id' ? sortConfig.order : 'None'}
            onClick={() => handleSort('process_id')}
          >
            <Label>Process</Label>
          </TableHeaderCell>

          {/* Description Column */}
          <TableHeaderCell
            sortIndicator={sortConfig.column === 'description' ? sortConfig.order : 'None'}
            onClick={() => handleSort('description')}
          >
            <Label>Description</Label>
          </TableHeaderCell>

          {/* Group ID Column */}
          <TableHeaderCell
            sortIndicator={sortConfig.column === 'group_id' ? sortConfig.order : 'None'}
            onClick={() => handleSort('group_id')}
          >
            <Label>Group</Label>
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
          key={row.process_id}
          actions={
            <>
              <TableRowAction
                icon="edit"
                text="Edit"
                onClick={() => onEdit(row.process_id)}
              />
              <TableRowAction
                icon="delete"
                text="Delete"
                onClick={() => onDelete(row.process_id)}
              />
            </>
          }
        >
          <TableCell>
            <Label>{row.process_id}</Label>
          </TableCell>
          <TableCell>
            <Label>{row.description}</Label>
          </TableCell>
          <TableCell>
            <Label>{row.group_id}</Label>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
