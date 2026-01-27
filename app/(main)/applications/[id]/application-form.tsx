'use client';

// =============================================================================
// Imports
// =============================================================================
import '@ui5/webcomponents-icons/dist/nav-back.js';
import '@ui5/webcomponents-icons/dist/save.js';
import { Bar, Button, Form, FormItem, Input, Label, Page, Title, MessageStrip } from '@ui5/webcomponents-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Application, CreateApplication, UpdateApplication, ActionResult } from './../db-actions';

interface ApplicationFormProps {
  initialData: Application;
}

/**
 * ApplicationForm Component
 * Handles both the creation of new applications and editing existing ones.
 */
export default function ApplicationForm({ initialData }: ApplicationFormProps) {
  // ---------------------------------------------------------------------------
  // Hooks & Constants
  // ---------------------------------------------------------------------------
  const router = useRouter();
  const isUpdate = Boolean(initialData.application_id?.trim());

  // ---------------------------------------------------------------------------
  // State Management
  // ---------------------------------------------------------------------------
  const [formData, setFormData] = useState<Application>(initialData);
  const [saveStatus, setSaveStatus] = useState<{
    design: 'Positive' | 'Negative';
    message: string;
  } | null>(null);
  const [errors, setErrors] = useState({
    application_id: false,
    description: false,
  });

  // ---------------------------------------------------------------------------
  // Logic Handlers
  // ---------------------------------------------------------------------------

  /**
   * Validates form input and triggers the appropriate database action
   */
  const handleSave = async () => {
    setSaveStatus(null);

    // Validation
    const newErrors = {
      application_id: !formData.application_id.trim(),
      description: !formData.description.trim(),
    };

    setErrors(newErrors);

    if (newErrors.application_id || newErrors.description) {
      setSaveStatus({ design: 'Negative', message: 'Please fix validation errors.' });
      return;
    }

    // Execution
    let result: ActionResult;

    if (isUpdate) {
      result = await UpdateApplication(formData.application_id, {
        description: formData.description,
      });
    } else {
      result = await CreateApplication(formData);
    }

    // Response Handling
    if (result.success) {
      setSaveStatus({
        design: 'Positive',
        message: `Application ${isUpdate ? 'updated' : 'created'} successfully!`,
      });

      setTimeout(() => {
        router.refresh();
      }, 1500);
    } else {
      setSaveStatus({
        design: 'Negative',
        message: result.error || 'A database error occurred.',
      });
    }
  };

  // =============================================================================
  // Main Render
  // =============================================================================
  return (
    <Page
      noScrolling={true}
      backgroundDesign="List"
      header={
        <Bar
          design="Header"
          style={{ height: '3.5rem' }}
          startContent={
            <>
              <Button
                icon="nav-back"
                design="Default"
                onClick={() => router.back()}
              />
              <Title level="H3">{isUpdate ? 'Edit' : 'Create'} Application</Title>
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
        saveStatus && (
          <Bar
            design="Footer"
            style={{ height: 'auto', padding: '0.5rem' }}
          >
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
      <Form
        style={{ width: '100%', height: '100%', padding: '1rem' }}
        labelSpan="S12 M2 L2 XL1"
        emptySpan="S0 M3 L5 XL7"
        layout="S1 M1 L1 XL1"
      >
        {/* Application ID Field */}
        <FormItem labelContent={<Label required>Application</Label>}>
          <Input
            value={formData.application_id}
            type="Text"
            readonly={isUpdate}
            valueState={errors.application_id ? 'Negative' : 'None'}
            valueStateMessage={<div>Application ID is required.</div>}
            onInput={(e: any) => {
              setFormData({ ...formData, application_id: e.target.value });
              if (errors.application_id) setErrors({ ...errors, application_id: false });
            }}
          />
        </FormItem>

        {/* Description Field */}
        <FormItem labelContent={<Label required>Description</Label>}>
          <Input
            value={formData.description || ''}
            valueState={errors.description ? 'Negative' : 'None'}
            valueStateMessage={<div>Description is required.</div>}
            onInput={(e: any) => {
              setFormData({ ...formData, description: e.target.value });
              if (errors.description) setErrors({ ...errors, description: false });
            }}
          />
        </FormItem>
      </Form>
    </Page>
  );
}
