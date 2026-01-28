'use client';

/**
 * ProcessItemsTable Component
 * Renders a list of items with edit and delete actions.
 */

import editIcon from '@ui5/webcomponents-icons/dist/edit.js';
import deleteIcon from '@ui5/webcomponents-icons/dist/delete.js';
import { Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell, Label, TableRowAction } from '@ui5/webcomponents-react';
import { ProcessItem } from './../db-actions';

interface ProcessItemsTableProps {
  items: ProcessItem[];
  onEdit: (item: ProcessItem) => void;
  onDelete: (item: ProcessItem) => void;
}

// Mapping object for Item Types
const TYPE_MAP: Record<number, string> = {
  1: 'Start',
  2: 'Intermediate',
  3: 'End',
};

export function ProcessItemsTable({ items, onEdit, onDelete }: ProcessItemsTableProps) {
  if (!items || items.length === 0) {
    return (
      <div
        style={{
          padding: '3rem',
          textAlign: 'center',
          backgroundColor: 'var(--sapList_Background)',
        }}
      >
        <Label>No items found for this process.</Label>
      </div>
    );
  }

  return (
    <Table
      style={{ width: '100%' }}
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
        </TableHeaderRow>
      }
      rowActionCount={2}
    >
      {items.map((item) => (
        <TableRow
          key={`${item.process_id}-${item.type}-${item.sequence}`}
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
            <Label>{TYPE_MAP[item.type as number] || item.type}</Label>
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
        </TableRow>
      ))}
    </Table>
  );
}
