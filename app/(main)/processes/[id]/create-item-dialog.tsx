'use client';

// ============================================================================
// Imports
// ============================================================================

import { Dialog, Button, Form, FormItem, Input, Bar, Label, Select, Option } from '@ui5/webcomponents-react';
import { useState, useEffect } from 'react';

import { ProcessEvent } from '../db-actions';
import { Application } from '../../applications/db-actions';

// ============================================================================
// Types
// ============================================================================

interface CreateItemDialogProps {
  open: boolean;
  onSave: (data: Omit<ProcessEvent, 'process_id'>, isEdit?: boolean) => void;
  onCancel: () => void;
  applications?: Application[];
  existingItems?: ProcessEvent[];
  editingItem?: ProcessEvent | null;
}

// ============================================================================
// Constants
// ============================================================================

const TYPE_MAP: Record<number, string> = {
  1: 'Start',
  2: 'Intermediate',
  3: 'End',
};

// ============================================================================
// Component
// ============================================================================

export function CreateItemDialog({
  open,
  onSave,
  onCancel,
  applications = [],
  existingItems = [],
  editingItem = null,
}: CreateItemDialogProps) {
  // --------------------------------------------------------------------------
  // State Management
  // --------------------------------------------------------------------------

  const [type, setType] = useState<number>(1);
  const [sequence, setSequence] = useState('');
  const [description, setDescription] = useState('');
  const [applicationId, setApplicationId] = useState('');
  const [error, setError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const [applicationError, setApplicationError] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------------

  /**
   * Reset and populate form based on dialog state.
   * If editing, populates with existing event data. Otherwise resets.
   */
  useEffect(() => {
    if (open) {
      if (editingItem) {
        setType(editingItem.type);
        setSequence(editingItem.sequence.toString());
        setDescription(editingItem.description);
        setApplicationId(editingItem.application_id);
      } else {
        setType(1);
        setSequence('');
        setDescription('');
        setApplicationId('');
      }
      setError(false);
      setDescriptionError(false);
      setApplicationError(false);
      setDuplicateError(null);
    }
  }, [open, editingItem]);

  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------

  /**
   * Validates and saves the event data.
   * Checks for duplicate type/sequence combinations before saving.
   *
   * @returns {void}
   */
  const handleSave = () => {
    const seqNumber = parseInt(sequence);
    let hasErrors = false;

    // Validate sequence
    if (isNaN(seqNumber)) {
      setError(true);
      hasErrors = true;
    } else {
      setError(false);
    }

    // Validate description
    if (!description.trim()) {
      setDescriptionError(true);
      hasErrors = true;
    } else {
      setDescriptionError(false);
    }

    // Validate application
    if (!applicationId.trim()) {
      setApplicationError(true);
      hasErrors = true;
    } else {
      setApplicationError(false);
    }

    if (hasErrors) {
      return;
    }

    // Check for duplicate (type, sequence) combination
    const isDuplicate = existingItems.some(
      (item) =>
        item.type === type &&
        item.sequence === seqNumber &&
        !(editingItem && editingItem.type === type && editingItem.sequence === seqNumber),
    );

    if (isDuplicate) {
      setDuplicateError(`An event with Type "${TYPE_MAP[type]}" and Sequence "${seqNumber}" already exists.`);
      return;
    }

    onSave(
      {
        type,
        sequence: seqNumber,
        description: description.trim(),
        application_id: applicationId.trim(),
      },
      !!editingItem,
    );

    resetForm();
  };

  /**
   * Resets all form state to initial values.
   *
   * @returns {void}
   */
  const resetForm = () => {
    setType(1);
    setSequence('');
    setDescription('');
    setApplicationId('');
    setError(false);
    setDescriptionError(false);
    setApplicationError(false);
    setDuplicateError(null);
  };

  /**
   * Cancels the dialog and resets form state.
   *
   * @returns {void}
   */
  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <Dialog
      open={open}
      headerText={editingItem ? 'Edit Process Event' : 'Create New Process Event'}
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

        <FormItem labelContent={<Label required>Description</Label>}>
          <Input
            value={description}
            valueState={descriptionError ? 'Negative' : 'None'}
            onInput={(e: any) => {
              setDescription(e.target.value);
              if (descriptionError) setDescriptionError(false);
            }}
          />
        </FormItem>

        <FormItem labelContent={<Label required>Application</Label>}>
          <Select
            valueState={applicationError ? 'Negative' : 'None'}
            onChange={(e) => {
              setApplicationId(e.detail.selectedOption.dataset.id || '');
              if (applicationError) setApplicationError(false);
            }}
          >
            <Option
              data-id=""
              selected={!applicationId}
            >
              -- Select Application --
            </Option>
            {applications.map((app) => (
              <Option
                key={app.application_id}
                data-id={app.application_id}
                selected={applicationId === app.application_id}
              >
                {app.description}
              </Option>
            ))}
          </Select>
        </FormItem>

        {duplicateError && (
          <FormItem>
            <div style={{ color: '#d32f2f', fontWeight: 500, marginTop: '0.5rem' }}>{duplicateError}</div>
          </FormItem>
        )}
      </Form>
    </Dialog>
  );
}
