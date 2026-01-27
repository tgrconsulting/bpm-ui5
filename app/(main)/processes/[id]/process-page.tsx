'use client';

import '@ui5/webcomponents-icons/dist/nav-back.js';
import '@ui5/webcomponents-icons/dist/save.js';
import { Bar, Button, Page, Title, MessageStrip } from '@ui5/webcomponents-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Process, CreateProcess, UpdateProcess, ActionResult } from '../db-actions';
import { ProcessTabContainer } from './process-tab-container';

interface ProcessPageProps {
  initialData: Process;
}

export default function ProcessPage({ initialData }: ProcessPageProps) {
  const router = useRouter();
  const isUpdate = Boolean(initialData.process_id?.trim());
  const [formData, setFormData] = useState<Process>(initialData);
  const [saveStatus, setSaveStatus] = useState<{ design: 'Positive' | 'Negative'; message: string } | null>(null);
  const [errors, setErrors] = useState({ process_id: false, description: false, group_id: false });

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

    const result: ActionResult = isUpdate
      ? await UpdateProcess(formData.process_id, { description: formData.description, group_id: formData.group_id })
      : await CreateProcess(formData);

    if (result.success) {
      setSaveStatus({ design: 'Positive', message: `Process ${isUpdate ? 'updated' : 'created'} successfully!` });
      setTimeout(() => router.refresh(), 1500);
    } else {
      setSaveStatus({ design: 'Negative', message: result.error || 'A database error occurred.' });
    }
  };

  return (
    <Page
      noScrolling={true}
      backgroundDesign="Solid"
      style={{
        // Overrides the internal content background variables to pure white
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
              />
              <Title level="H3">{isUpdate ? 'Edit' : 'Create'} Process</Title>
            </>
          }
          endContent={
            <Button
              design="Emphasized"
              icon="save"
              onClick={handleSave}
            >
              {isUpdate ? 'Update' : 'Save'}
            </Button>
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
      />
    </Page>
  );
}
