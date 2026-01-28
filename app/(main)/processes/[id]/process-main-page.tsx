'use client';

import '@ui5/webcomponents-icons/dist/nav-back.js';
import '@ui5/webcomponents-icons/dist/save.js';
import createIcon from '@ui5/webcomponents-icons/dist/create.js';
import { Bar, Button, Page, Title, MessageStrip } from '@ui5/webcomponents-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Process, CreateProcess, UpdateProcess, ActionResult, ProcessItem } from '../db-actions';
import { ProcessTabContainer } from './process-tab-container';
import { CreateItemDialog } from './create-item-dialog';

interface ProcessPageProps {
  initialData: Process;
}

export default function ProcessPage({ initialData }: ProcessPageProps) {
  const router = useRouter();

  // -- State Management --
  const isUpdate = Boolean(initialData.process_id?.trim());
  const [formData, setFormData] = useState<Process>(initialData);
  const [activeTab, setActiveTab] = useState('General');
  const [saveStatus, setSaveStatus] = useState<{
    design: 'Positive' | 'Negative' | 'Information';
    message: string;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errors, setErrors] = useState({
    process_id: false,
    description: false,
    group_id: false,
  });

  /**
   * Handles saving a new item from the Dialog.
   * Merges the Omitted data with the current process_id and updates local state.
   */
  const handleItemSave = (newItem: Omit<ProcessItem, 'process_id'>) => {
    setIsDialogOpen(false);

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
      message: `Item: ${newItem.description} added to list. Click Save to persist changes.`,
    });

    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);
  };

  const handleSave = async () => {
    setSaveStatus(null);
    const newErrors = {
      process_id: !formData.process_id.trim(),
      description: !formData.description.trim(),
      group_id: !formData.group_id?.trim(),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some((err) => err)) {
      setSaveStatus({ design: 'Negative', message: 'Please fix validation errors.' });
      return;
    }

    // Call the Server Action
    const result: ActionResult = isUpdate
      ? await UpdateProcess(formData.process_id, formData)
      : await CreateProcess(formData);

    if (result.success) {
      setSaveStatus({
        design: 'Positive',
        message: `Process ${isUpdate ? 'updated' : 'created'} successfully!`,
      });
      // Refresh the page data from server
      setTimeout(() => router.refresh(), 1500);
    } else {
      setSaveStatus({
        design: 'Negative',
        message: result.error || 'A database error occurred.',
      });
    }
  };

  return (
    <Page
      noScrolling={true}
      backgroundDesign="Solid"
      style={{
        ['--sapBackgroundColor' as any]: '#ffffff',
        ['--sapGroup_ContentBackground' as any]: '#ffffff',
      }}
      header={
        <Bar
          design="Header"
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
                icon={createIcon}
                onClick={() => setIsDialogOpen(true)}
                disabled={activeTab !== 'Items'}
              >
                Create Item
              </Button>
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
        saveStatus && (
          <Bar design="Footer">
            <MessageStrip
              design={saveStatus.design}
              onClose={() => setSaveStatus(null)}
              style={{ width: '100%' }}
            >
              {saveStatus.message}
            </MessageStrip>
          </Bar>
        )
      }
    >
      <ProcessTabContainer
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        isUpdate={isUpdate}
        availableGroups={initialData.groups || []}
        onTabChange={setActiveTab}
      />

      <CreateItemDialog
        open={isDialogOpen}
        onSave={handleItemSave}
        onCancel={() => setIsDialogOpen(false)}
      />
    </Page>
  );
}
