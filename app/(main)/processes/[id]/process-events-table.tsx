'use client';

import editIcon from '@ui5/webcomponents-icons/dist/edit.js';
import deleteIcon from '@ui5/webcomponents-icons/dist/delete.js';
import {
  Table,
  TableHeaderRow,
  TableHeaderCell,
  TableRow,
  TableCell,
  Label,
  TableRowAction,
} from '@ui5/webcomponents-react';
import { ProcessEvent } from '../db-actions';

interface ProcessItemsTableProps {
  items: ProcessEvent[];
  onEdit: (item: ProcessEvent) => void;
  onDelete: (item: ProcessEvent) => void;
}

// Mapping object for Item Types
const TYPE_MAP: Record<number, string> = {
  1: 'Start',
  2: 'Intermediate',
  3: 'End',
};

export function ProcessEventsTable({ items, onEdit, onDelete }: ProcessItemsTableProps) {
  if (!items || items.length === 0) {
    return (
      <div
        style={{
          marginTop: '2rem',
          textAlign: 'center',
        }}
      >
        <Label>
          <strong>No items found for this process.</strong>
        </Label>
      </div>
    );
  }

  return (
    <Table
      style={{ height: '100%', width: '100%', minWidth: '100%', marginTop: '0.1rem' }}
      overflowMode="Scroll"
      headerRow={
        <TableHeaderRow sticky>
          <TableHeaderCell>
            <Label>Type</Label>
          </TableHeaderCell>
          <TableHeaderCell>
            <Label>Sequence</Label>
          </TableHeaderCell>
          <TableHeaderCell>
            <Label>Description</Label>
          </TableHeaderCell>
          <TableHeaderCell>
            <Label>Application</Label>
          </TableHeaderCell>
          <TableHeaderCell>
            <Label>Duration (Sec)</Label>
          </TableHeaderCell>
        </TableHeaderRow>
      }
      rowActionCount={2}
    >
      {items.map((item) => (
        <TableRow
          key={`${item.process_id}-${item.event_type}-${item.sequence}`}
          actions={
            <>
              <TableRowAction
                icon={editIcon}
                text="Edit"
                onClick={() => onEdit(item)}
              />
              <TableRowAction
                icon={deleteIcon}
                text="Delete"
                onClick={() => onDelete(item)}
              />
            </>
          }
        >
          <TableCell>
            {/* Display the mapped string, or the number itself if not found */}
            <Label>{TYPE_MAP[item.event_type as number] || item.event_type}</Label>
          </TableCell>
          <TableCell>
            <Label>{item.sequence}</Label>
          </TableCell>
          <TableCell>
            <Label>{item.description}</Label>
          </TableCell>
          <TableCell>
            <Label>{item.application_id}</Label>
          </TableCell>
          <TableCell>
            <Label>{item.duration}</Label>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
