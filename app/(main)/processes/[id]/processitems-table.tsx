'use client';

import { Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell, Label } from '@ui5/webcomponents-react';

interface ProcessItemsTableProps {
  items: any[];
}

export function ProcessItemsTable({ items }: ProcessItemsTableProps) {
  // If there are no items, we can show a placeholder or just an empty table
  if (!items || items.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Label>No items found for this process.</Label>
      </div>
    );
  }

  return (
    <Table
      style={{ width: '100%' }}
      headerRow={
        <TableHeaderRow sticky>
          <TableHeaderCell style={{ width: '10rem' }}>
            <Label>Item No.</Label>
          </TableHeaderCell>
          <TableHeaderCell>
            <Label>Description</Label>
          </TableHeaderCell>
        </TableHeaderRow>
      }
    >
      {items.map((item: any) => (
        <TableRow key={`${item.process_id}-${item.item}`}>
          <TableCell>
            <Label>{item.item}</Label>
          </TableCell>
          <TableCell>
            <Label>{item.description}</Label>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
