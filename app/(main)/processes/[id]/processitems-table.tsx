'use client';

/**
 * ProcessItemsTable Component
 *
 * Renders a read-only list of items associated with a specific process.
 * Features a sticky header for improved usability in long lists.
 */

import { Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell, Label } from '@ui5/webcomponents-react';
import { ProcessItem } from './../db-actions';

interface ProcessItemsTableProps {
  /** Array of process items to display in the table */
  items: ProcessItem[];
}

export function ProcessItemsTable({ items }: ProcessItemsTableProps) {
  // Handle empty state scenarios
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
            <Label showColon>Type</Label>
          </TableHeaderCell>
          <TableHeaderCell>
            <Label showColon>Sequence</Label>
          </TableHeaderCell>
          <TableHeaderCell>
            <Label showColon>Description</Label>
          </TableHeaderCell>
        </TableHeaderRow>
      }
    >
      {items.map((item) => (
        <TableRow key={`${item.process_id}-(${item.type})-${item.sequence}`}>
          <TableCell>
            <Label>{item.type}</Label>
          </TableCell>
          <TableCell>
            <Label>{item.sequence}</Label>
          </TableCell>
          <TableCell>
            <Label>{item.description}</Label>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
