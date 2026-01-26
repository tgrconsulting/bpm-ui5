'use client';

// =============================================================================
// Imports
// =============================================================================
import '@ui5/webcomponents-icons/dist/nav-back.js';
import '@ui5/webcomponents-icons/dist/save.js';
import {
  Bar,
  Button,
  Form,
  FormItem,
  Input,
  Label,
  Page,
  Title,
  MessageStrip,
  ComboBox,
  ComboBoxItem,
} from '@ui5/webcomponents-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Process, CreateProcess, UpdateProcess, ActionResult } from '../db-actions';

interface ProcessFormProps {
  initialData: Process;
}

export default function ProcessForm({ initialData }: ProcessFormProps) {
  // ---------------------------------------------------------------------------
  // Hooks & Constants
  // ---------------------------------------------------------------------------
  const router = useRouter();
  const isUpdate = Boolean(initialData.process_id?.trim() && initialData.process_id !== '');

  // Extract groups list provided by ReadProcess
  const availableGroups = initialData.groups || [];

  // ---------------------------------------------------------------------------
  // State Management
  // ---------------------------------------------------------------------------
  const [formData, setFormData] = useState<Process>(initialData);
  const [saveStatus, setSaveStatus] = useState<{
    design: 'Positive' | 'Negative';
    message: string;
  } | null>(null);
  const [errors, setErrors] = useState({
    process_id: false,
    description: false,
    group_id: false,
  });

  // ---------------------------------------------------------------------------
  // Logic Handlers
  // ---------------------------------------------------------------------------

  const handleSave = async () => {
    setSaveStatus(null);

    // Validation
    const newErrors = {
      process_id: !formData.process_id.trim(),
      description: !formData.description.trim(),
      group_id: !formData.group_id?.trim(),
    };

    setErrors(newErrors);

    if (newErrors.process_id || newErrors.description || newErrors.group_id) {
      setSaveStatus({ design: 'Negative', message: 'Please fix validation errors.' });
      return;
    }

    // Execution
    let result: ActionResult;

    if (isUpdate) {
      result = await UpdateProcess(formData.process_id, {
        description: formData.description,
        group_id: formData.group_id, // Pass group_id to update action
      });
    } else {
      result = await CreateProcess(formData);
    }

    // Response Handling
    if (result.success) {
      setSaveStatus({
        design: 'Positive',
        message: `Process ${isUpdate ? 'updated' : 'created'} successfully!`,
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
        labelSpan="S12 M2 L2 XL2"
        emptySpan="S0 M3 L5 XL6"
        layout="S1 M1 L1 XL1"
      >
        {/* Process ID Field */}
        <FormItem labelContent={<Label required>Process</Label>}>
          <Input
            value={formData.process_id}
            readonly={isUpdate}
            valueState={errors.process_id ? 'Negative' : 'None'}
            onInput={(e: any) => {
              setFormData({ ...formData, process_id: e.target.value });
              if (errors.process_id) setErrors({ ...errors, process_id: false });
            }}
          />
        </FormItem>

        {/* Group ID Field (Combo Box) */}
        <FormItem labelContent={<Label required>Group</Label>}>
          <ComboBox
            value={formData.group_id || ''}
            valueState={errors.group_id ? 'Negative' : 'None'}
            onSelectionChange={(e: any) => {
              const selectedId = e.detail.item ? e.detail.item.text : '';
              setFormData({ ...formData, group_id: selectedId });
              if (errors.group_id) setErrors({ ...errors, group_id: false });
            }}
          >
            {availableGroups.map((group) => (
              <ComboBoxItem
                key={group.group_id}
                text={group.group_id}
                additionalText={group.description}
              />
            ))}
          </ComboBox>
        </FormItem>

        {/* Description Field */}
        <FormItem labelContent={<Label required>Description</Label>}>
          <Input
            value={formData.description || ''}
            valueState={errors.description ? 'Negative' : 'None'}
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
