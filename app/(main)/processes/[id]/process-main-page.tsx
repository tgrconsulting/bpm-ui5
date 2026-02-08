'use client';

// ============================================================================
// Imports
// ============================================================================

import '@ui5/webcomponents-icons/dist/nav-back.js';
import '@ui5/webcomponents-icons/dist/save.js';
import createIcon from '@ui5/webcomponents-icons/dist/create.js';
import { Bar, Button, Page, Title, MessageStrip, MessageBox, MessageBoxAction } from '@ui5/webcomponents-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Process, CreateProcess, UpdateProcess, ActionResult, ProcessEvent } from '../db-actions';
import { ProcessItemsTable } from './processitems-table';
import { CreateItemDialog } from './create-item-dialog';
import { ProcessGeneralForm } from './process-general-form';

// ============================================================================
// Types
// ============================================================================

interface ProcessPageProps {
  initialData: Process;
}

// ============================================================================
// Component
// ============================================================================

export default function ProcessPage({ initialData }: ProcessPageProps) {
  const router = useRouter();

  // --------------------------------------------------------------------------
  // State Management
  // --------------------------------------------------------------------------

  const isUpdate = Boolean(initialData.process_id?.trim());
  const [formData, setFormData] = useState<Process>(initialData);
  const [saveStatus, setSaveStatus] = useState<{
    design: 'Positive' | 'Negative' | 'Information';
    message: string;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProcessEvent | null>(null);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<ProcessEvent | null>(null);
  const [errors, setErrors] = useState({
    process_id: false,
    process_type: false,
    group_id: false,
    description: false,
  });

  useEffect(() => {
    // Check if every value in the errors object is false
    const hasNoErrors = Object.values(errors).every((error) => error === false);

    if (hasNoErrors) {
      setSaveStatus(null);
    }
  }, [errors]);

  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------

  /**
   * Handles saving a new or edited process event.
   * For new events: Adds to the processItems array.
   * For edits: Updates the existing event in the array.
   *
   * @param newItem - The event data to save (excluding process_id)
   * @param isEdit - Whether this is an edit operation (default: false)
   */
  const handleItemSave = (newItem: Omit<ProcessEvent, 'process_id'>, isEdit: boolean = false) => {
    setIsDialogOpen(false);

    if (isEdit && editingItem) {
      // Update existing event
      setFormData((prev) => ({
        ...prev,
        processItems: (prev.processItems || []).map((item) =>
          item.type === editingItem.type && item.sequence === editingItem.sequence ? { ...item, ...newItem } : item,
        ),
      }));
      setEditingItem(null);
      setSaveStatus({
        design: 'Positive',
        message: 'Event updated. Click Save to persist changes.',
      });
    } else {
      // Add new event
      setFormData((prev) => ({
        ...prev,
        processItems: [
          ...(prev.processItems || []),
          {
            ...newItem,
            process_id: prev.process_id,
          },
        ],
      }));
      setSaveStatus({
        design: 'Positive',
        message: `Event: ${newItem.description} added to list. Click Save to persist changes.`,
      });
    }

    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);
  };

  /**
   * Opens the dialog for editing a process event.
   *
   * @param item - The event to edit
   */
  const handleEditItem = (item: ProcessEvent) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  /**
   * Handles deletion confirmation for a process event.
   * Removes the event from the list if confirmed.
   *
   * @param action - The user's action (OK or Cancel)
   */
  const handleConfirmDeleteItem = (action: MessageBoxAction | undefined) => {
    if (action === MessageBoxAction.OK && pendingDeleteItem) {
      const itemToDelete = pendingDeleteItem;
      setFormData((prev) => ({
        ...prev,
        processItems: (prev.processItems || []).filter(
          (item) => !(item.type === itemToDelete.type && item.sequence === itemToDelete.sequence),
        ),
      }));
      setSaveStatus({
        design: 'Positive',
        message: 'Event deleted. Click Save to persist changes.',
      });
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    }
    setPendingDeleteItem(null);
  };

  /**
   * Handles saving the entire process with its events.
   * Validates all required fields before submission.
   */
  const handleSave = async () => {
    setSaveStatus(null);
    const newErrors = {
      process_id: !formData.process_id.trim(),
      process_type: !formData.process_type?.trim(),
      group_id: !formData.group_id?.trim(),
      description: !formData.description.trim(),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some((err) => err)) {
      setSaveStatus({ design: 'Negative', message: 'Please fix validation errors.' });
      return;
    }

    const result: ActionResult = isUpdate
      ? await UpdateProcess(formData.process_id, formData)
      : await CreateProcess(formData);

    if (result.success) {
      setSaveStatus({
        design: 'Positive',
        message: `Process ${isUpdate ? 'updated' : 'created'} successfully!`,
      });
      setTimeout(() => {
        router.refresh();
        setSaveStatus(null);
      }, 3000);
    } else {
      setSaveStatus({
        design: 'Negative',
        message: result.error || 'A database error occurred.',
      });
    }
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <>
      <MessageBox
        open={!!pendingDeleteItem}
        onClose={(action: any) => handleConfirmDeleteItem(action)}
        type="Confirm"
      >
        Are you sure you want to delete this Process Event (Type:{' '}
        {pendingDeleteItem?.type === 1 ? 'Start' : pendingDeleteItem?.type === 2 ? 'Intermediate' : 'End'}, Sequence:{' '}
        {pendingDeleteItem?.sequence})?
      </MessageBox>

      <Page
        noScrolling={true}
        backgroundDesign="Solid"
        style={{
          height: '100%',
        }}
        header={
          <Bar
            style={{ height: '3.5rem' }}
            startContent={
              <>
                <Button
                  icon="nav-back"
                  onClick={() => router.back()}
                  accessibilityAttributes={{ ariaLabel: 'Go Back' } as any}
                />
                <Title level="H3">{isUpdate ? 'Edit' : 'Create'} Process</Title>
              </>
            }
            endContent={
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Button
                  design="Emphasized"
                  icon="save"
                  onClick={handleSave}
                >
                  Save
                </Button>
              </div>
            }
          />
        }
        footer={
          <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
            {saveStatus && (
              <Bar design="Footer">
                <MessageStrip
                  design={saveStatus.design}
                  onClose={() => setSaveStatus(null)}
                  style={{ width: '100%' }}
                >
                  {saveStatus.message}
                </MessageStrip>
              </Bar>
            )}
          </div>
        }
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            marginTop: '2rem',
          }}
        >
          <ProcessGeneralForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            isUpdate={isUpdate}
            availableGroups={initialData.groups || []}
          />

          <Bar
            design="Header"
            style={{ height: '3.5rem', marginTop: '2rem' }}
            startContent={
              <>
                <Title level="H3">Process Events</Title>
              </>
            }
            endContent={
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Button
                  icon={createIcon}
                  onClick={() => setIsDialogOpen(true)}
                >
                  Create Event
                </Button>
              </div>
            }
          />
          <div
            style={{
              flex: 1, // Grow to fill remaining space
              overflow: 'hidden', // Contain the table so it scrolls internally
              display: 'flex', // Make this a flex child too
              flexDirection: 'column',
              marginBottom: '0.5rem',
            }}
          >
            <ProcessItemsTable
              items={formData.processItems || []}
              onEdit={handleEditItem}
              onDelete={(item) => setPendingDeleteItem(item)}
            />
          </div>
        </div>
        <CreateItemDialog
          open={isDialogOpen}
          onSave={handleItemSave}
          onCancel={() => {
            setIsDialogOpen(false);
            setEditingItem(null);
          }}
          applications={initialData.applications || []}
          existingItems={formData.processItems || []}
          editingItem={editingItem}
        />
      </Page>
    </>
  );
}
