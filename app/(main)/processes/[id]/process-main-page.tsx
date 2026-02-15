'use client';

// ============================================================================
// Imports
// ============================================================================

import { isEqual } from 'lodash';
import activateIcon from '@ui5/webcomponents-icons/dist/activate.js';
import createIcon from '@ui5/webcomponents-icons/dist/create.js';
import acceptIcon from '@ui5/webcomponents-icons/dist/accept.js';
import '@ui5/webcomponents-icons/dist/nav-back.js';
import '@ui5/webcomponents-icons/dist/save.js';
import { Bar, Button, Icon, MessageBox, MessageBoxAction, MessageStrip, Page, Title } from '@ui5/webcomponents-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

import { ActionResult, CreateProcess, Process, ProcessEvent, UpdateProcess } from '../db-actions';
import { CreateItemDialog } from './create-item-dialog';
import { ProcessGeneralForm } from './process-general-form';
import { ProcessEventsTable } from './process-events-table';

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
  // State Management & Constants
  // --------------------------------------------------------------------------

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStatusActive, setIsStatusActive] = useState<boolean>(initialData.process_status === 'A');
  const [editingItem, setEditingItem] = useState<ProcessEvent | null>(null);
  const [pendingDeleteItem, setPendingDeleteEvent] = useState<ProcessEvent | null>(null);
  const [isUpdate, setIsUpdate] = useState<boolean>(Boolean(initialData.process_id?.trim()));
  const [formData, setFormData] = useState<Process>(initialData);
  const [saveStatus, setSaveStatus] = useState<{
    design: 'Positive' | 'Negative' | 'Information';
    message: string;
  } | null>(null);
  const [errors, setErrors] = useState({
    process_id: false,
    process_type: false,
    group_id: false,
    description: false,
    items: false,
  });
  const [baseData, setBaseData] = useState<Process>(initialData);

  const isDirty = useMemo(() => {
    return !isEqual(formData, baseData);
  }, [formData, baseData]);

  const statusText = isStatusActive ? 'De-Activate' : 'Activate';

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
   * For new events: Adds to the processEvents array.
   * For edits: Updates the existing event in the array.
   *
   * @param newItem - The event data to save (excluding process_id)
   * @param isEdit - Whether this is an edit operation (default: false)
   */
  const handleItemSave = (newItem: Omit<ProcessEvent, 'process_id'>, isEdit: boolean = false) => {
    setIsDialogOpen(false);

    setFormData((prev) => {
      let updatedItems = [];

      if (isEdit && editingItem) {
        // 1. Update existing event
        updatedItems = (prev.processEvents || []).map((item) =>
          item.type === editingItem.type && item.sequence === editingItem.sequence ? { ...item, ...newItem } : item,
        );
      } else {
        // 2. Add new event
        updatedItems = [...(prev.processEvents || []), { ...newItem, process_id: prev.process_id }];
      }

      // 3. Sort the updated array by Type, then by Sequence
      const sortedItems = [...updatedItems].sort((a, b) => {
        // Sort by Type (numeric)
        if (a.type !== b.type) {
          return a.type - b.type;
        }
        // If Types are equal, sort by Sequence (numeric)
        return a.sequence - b.sequence;
      });

      return {
        ...prev,
        processEvents: sortedItems,
      };
    });

    // Reset editing state and set status messages
    setEditingItem(null);
    setSaveStatus({
      design: 'Positive',
      message: isEdit ? 'Event updated.' : `Event: ${newItem.description} added.`,
    });

    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleEditItem = (item: ProcessEvent) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleConfirmDeleteItem = (action: MessageBoxAction | undefined) => {
    if (action === MessageBoxAction.OK && pendingDeleteItem) {
      const itemToDelete = pendingDeleteItem;
      setFormData((prev) => ({
        ...prev,
        processEvents: (prev.processEvents || []).filter(
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
    setPendingDeleteEvent(null);
  };

  const handleActivate = () => {
    setIsStatusActive(!isStatusActive);
    const newStatus = isStatusActive ? 'I' : 'A';
    setFormData((prev) => ({
      ...prev,
      process_status: newStatus,
    }));
  };

  const handleSave = async () => {
    setSaveStatus(null);

    // Validation of general form fields
    const newErrors = {
      process_id: !formData.process_id.trim(),
      process_type: !formData.process_type?.trim(),
      group_id: !formData.group_id?.trim(),
      description: !formData.description.trim(),
      items: false,
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some((err) => err)) {
      setSaveStatus({ design: 'Negative', message: 'Please fix validation errors.' });
      return;
    }

    // Validation of process items
    const items = formData.processEvents || [];
    const typeCounts = items.reduce((acc: Record<string, number>, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});

    let itemValidationError = '';

    if (formData.process_type === 'S') {
      // Rule: Exactly 1 item total, and it must be type 1
      if (items.length !== 1 || typeCounts[1] !== 1) {
        itemValidationError = "Type 'Single' must have exactly one item of type 1.";
      }
    } else if (formData.process_type === 'D') {
      // Rule: Exactly one Type 1, Exactly one Type 3, 0 or more Type 2
      const hasExactlyOneType1 = typeCounts[1] === 1;
      const hasExactlyOneType3 = typeCounts[3] === 1;

      // Verification: Are there any types present that aren't 1, 2, or 3?
      const invalidTypes = Object.keys(typeCounts).filter((type) => !['1', '2', '3'].includes(type));

      if (!hasExactlyOneType1 || !hasExactlyOneType3) {
        itemValidationError = "Type 'Standard' must have exactly one Type 1 and exactly one Type 3.";
      } else if (invalidTypes.length > 0) {
        itemValidationError = `Type 'Standard' contains invalid types: ${invalidTypes.join(', ')}.`;
      }
    }

    if (itemValidationError) {
      const newErrors = {
        process_id: false,
        process_type: false,
        group_id: false,
        description: false,
        items: true,
      };
      setErrors(newErrors);

      setSaveStatus({ design: 'Negative', message: itemValidationError });
      return;
    }

    const result: ActionResult = isUpdate
      ? await UpdateProcess(formData.process_id, formData)
      : await CreateProcess(formData);

    if (result.success) {
      setIsUpdate(true);
      setBaseData(formData);
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
                  icon={activateIcon}
                  onClick={handleActivate}
                >
                  {statusText}
                </Button>
                <Button
                  design="Emphasized"
                  icon="save"
                  onClick={handleSave}
                >
                  Save
                </Button>
                <Icon
                  design={isDirty ? 'Negative' : 'Positive'}
                  name={acceptIcon}
                />
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
          }}
        >
          <Bar
            design="Header"
            style={{ height: '3.5rem' }}
            startContent={
              <>
                <Title level="H3">General</Title>
              </>
            }
          />
          <ProcessGeneralForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            isUpdate={isUpdate}
            isStatusActive={isStatusActive}
            availableGroups={initialData.groups || []}
          />

          <Bar
            design="Header"
            style={{ height: '3.5rem', marginTop: '1rem' }}
            startContent={
              <>
                <Title level="H3">Events</Title>
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
            <ProcessEventsTable
              items={formData.processEvents || []}
              onEdit={handleEditItem}
              onDelete={(item) => setPendingDeleteEvent(item)}
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
          existingItems={formData.processEvents || []}
          editingItem={editingItem}
        />
      </Page>
    </>
  );
}
