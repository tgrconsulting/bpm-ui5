'use client';

// ============================================================================
// Imports
// ============================================================================

import editIcon from '@ui5/webcomponents-icons/dist/edit.js';
import deleteIcon from '@ui5/webcomponents-icons/dist/delete.js';
import statusPositiveIcon from '@ui5/webcomponents-icons/dist/status-positive.js';
import statusCriticalIcon from '@ui5/webcomponents-icons/dist/status-critical.js';
import {
  Table,
  TableRow,
  TableCell,
  TableHeaderRow,
  TableHeaderCell,
  TableGrowing,
  TableRowAction,
  Label,
  Icon,
} from '@ui5/webcomponents-react';
import { useMemo, useState } from 'react';
import { Process } from './db-actions';

// ============================================================================
// Types & Constants
// ============================================================================

type SortOrder = 'Ascending' | 'Descending' | 'None';

interface SortConfig {
  column: keyof Process | null;
  order: SortOrder;
}

interface ProcessesTableProps {
  data: Process[];
  hasMore: boolean;
  onLoadMore: (event: any) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const PROCESS_TYPE_LABELS: Record<string, string> = {
  S: 'Single',
  D: 'Standard',
  B: 'Batch',
};

// ============================================================================
// Component
// ============================================================================

export function ProcessesTable({ data, hasMore, onLoadMore, onEdit, onDelete }: ProcessesTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: 'process_id',
    order: 'Ascending',
  });

  const handleSort = (column: keyof Process) => {
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

  const sortedData = useMemo(() => {
    if (!sortConfig.column || sortConfig.order === 'None') return data;

    return [...data].sort((a, b) => {
      let aValue = (a[sortConfig.column!] || '').toString().toLowerCase();
      let bValue = (b[sortConfig.column!] || '').toString().toLowerCase();

      if (sortConfig.column === 'process_type') {
        aValue = (PROCESS_TYPE_LABELS[a.process_type as string] || '').toLowerCase();
        bValue = (PROCESS_TYPE_LABELS[b.process_type as string] || '').toLowerCase();
      }

      if (aValue < bValue) return sortConfig.order === 'Ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.order === 'Ascending' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const renderStatusIcon = (status: string) => {
    // Wrapped in a centered div to ensure middle alignment within the cell
    return (
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        {status === 'A' && (
          <Icon
            name={statusPositiveIcon}
            design="Positive"
            accessibleName="Active"
            title="Active"
          />
        )}
        {status === 'I' && (
          <Icon
            name={statusCriticalIcon}
            design="Critical"
            accessibleName="Inactive"
            title="Inactive"
          />
        )}
      </div>
    );
  };

  return (
    <Table
      style={{ height: '100%', width: '100%', minWidth: '100%' }}
      headerRow={
        <TableHeaderRow sticky>
          <TableHeaderCell
            sortIndicator={sortConfig.column === 'process_id' ? sortConfig.order : 'None'}
            onClick={() => handleSort('process_id')}
          >
            <Label>Process</Label>
          </TableHeaderCell>

          <TableHeaderCell
            sortIndicator={sortConfig.column === 'description' ? sortConfig.order : 'None'}
            onClick={() => handleSort('description')}
          >
            <Label>Description</Label>
          </TableHeaderCell>

          <TableHeaderCell
            sortIndicator={sortConfig.column === 'group_id' ? sortConfig.order : 'None'}
            onClick={() => handleSort('group_id')}
          >
            <Label>Group</Label>
          </TableHeaderCell>

          <TableHeaderCell
            sortIndicator={sortConfig.column === 'process_type' ? sortConfig.order : 'None'}
            onClick={() => handleSort('process_type')}
          >
            <Label>Type</Label>
          </TableHeaderCell>

          <TableHeaderCell
            horizontalAlign="Center"
            sortIndicator={sortConfig.column === 'process_status' ? sortConfig.order : 'None'}
            onClick={() => handleSort('process_status')}
          >
            <Label>Status</Label>
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
                icon={editIcon}
                text="Edit"
                onClick={() => onEdit(row.process_id)}
              />
              <TableRowAction
                icon={deleteIcon}
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
          <TableCell>
            <Label>{PROCESS_TYPE_LABELS[row.process_type as string] || row.process_type}</Label>
          </TableCell>
          {/* Status Cell with centered icon content */}
          <TableCell>{renderStatusIcon(row.process_status as string)}</TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
