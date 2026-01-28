'use client';

import { Dialog, Button, Form, FormItem, Input, Bar, Label, Select, Option } from '@ui5/webcomponents-react';
import { useState } from 'react';
// Import the interface from your db-actions file
import { ProcessItem } from './../db-actions';

interface CreateItemDialogProps {
  open: boolean;
  /** Pass the item data back without process_id as it is handled by the parent */
  onSave: (data: Omit<ProcessItem, 'process_id'>) => void;
  onCancel: () => void;
}

export function CreateItemDialog({ open, onSave, onCancel }: CreateItemDialogProps) {
  const [type, setType] = useState<number>(1);
  const [sequence, setSequence] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(false);

  const handleSave = () => {
    const seqNumber = parseInt(sequence);
    if (isNaN(seqNumber)) {
      setError(true);
      return;
    }

    // Using the interface structure
    onSave({
      type,
      sequence: seqNumber,
      description,
    });

    resetForm();
  };

  const resetForm = () => {
    setType(1);
    setSequence('');
    setDescription('');
    setError(false);
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <Dialog
      open={open}
      headerText="Create New Process Item"
      footer={
        <Bar
          design="Footer"
          endContent={
            <>
              <Button
                design="Emphasized"
                onClick={handleSave}
              >
                Save
              </Button>
              <Button onClick={handleCancel}>Cancel</Button>
            </>
          }
        />
      }
    >
      <Form
        style={{ width: '100%' }}
        labelSpan="S12 M4 L4 XL4"
      >
        <FormItem labelContent={<Label required>Type</Label>}>
          <Select onChange={(e) => setType(Number(e.detail.selectedOption.dataset.id))}>
            <Option
              data-id="1"
              selected={type === 1}
            >
              Start
            </Option>
            <Option
              data-id="2"
              selected={type === 2}
            >
              Intermediate
            </Option>
            <Option
              data-id="3"
              selected={type === 3}
            >
              End
            </Option>
          </Select>
        </FormItem>

        <FormItem labelContent={<Label required>Sequence</Label>}>
          <Input
            type="Number"
            value={sequence}
            valueState={error ? 'Negative' : 'None'}
            onInput={(e: any) => {
              setSequence(e.target.value);
              if (error) setError(false);
            }}
          />
        </FormItem>

        <FormItem labelContent={<Label>Description</Label>}>
          <Input
            value={description}
            onInput={(e: any) => setDescription(e.target.value)}
          />
        </FormItem>
      </Form>
    </Dialog>
  );
}
