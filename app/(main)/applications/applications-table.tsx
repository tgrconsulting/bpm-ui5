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
import { Application } from './db-actions';

// =============================================================================
// Types & Constants
// =============================================================================
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

/**
 * ApplicationsTable Component
 * Displays application data with pre-configured initial sorting.
 */
export function ApplicationsTable({ data, hasMore, onLoadMore, onEdit, onDelete }: ApplicationsTableProps) {
  // ---------------------------------------------------------------------------
  // State Management
  // ---------------------------------------------------------------------------

  /**
   * INITIALIZATION: Set the default sort to 'applicationid' / 'Ascending'
   * This ensures the sort indicator is visible on the first render.
   */
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: 'applicationid',
    order: 'Ascending',
  });

  // ---------------------------------------------------------------------------
  // Logic Handlers
  // ---------------------------------------------------------------------------

  const handleSort = (column: keyof Application) => {
    let newOrder: SortOrder = 'Ascending';
    if (sortConfig.column === column) {
      if (sortConfig.order === 'Ascending') newOrder = 'Descending';
      else if (sortConfig.order === 'Descending') newOrder = 'None';
    }
    setSortConfig({ column, order: newOrder });
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
          {/* Application ID Column */}
          <TableHeaderCell
            // Dynamically reflects the initial 'Ascending' state
            sortIndicator={sortConfig.column === 'applicationid' ? sortConfig.order : 'None'}
            onClick={() => handleSort('applicationid')}
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
          key={row.applicationid}
          actions={
            <>
              <TableRowAction
                icon="edit"
                text="Edit"
                onClick={() => onEdit(row.applicationid)}
              />
              <TableRowAction
                icon="delete"
                text="Delete"
                onClick={() => onDelete(row.applicationid)}
              />
            </>
          }
        >
          <TableCell>
            <Label>{row.applicationid}</Label>
          </TableCell>
          <TableCell>
            <Label>{row.description}</Label>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
