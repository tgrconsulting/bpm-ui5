'use client';

// ============================================================================
// Imports
// ============================================================================

import acceptIcon from '@ui5/webcomponents-icons/dist/accept.js';
import navBackIcon from '@ui5/webcomponents-icons/dist/nav-back.js';
import saveIcon from '@ui5/webcomponents-icons/dist/save.js';
import { Bar, Button, Form, FormItem, Icon, Input, Label, MessageStrip, Page, Title } from '@ui5/webcomponents-react';
import { isEqual } from 'lodash';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ActionResult, CreateGroup, Group, UpdateGroup } from '../db-actions';

// ============================================================================
// Types
// ============================================================================

interface GroupFormProps {
  initialData: Group;
}

// ============================================================================
// Component
// ============================================================================

export default function GroupForm({ initialData }: GroupFormProps) {
  // --------------------------------------------------------------------------
  // Hooks & Setup
  // --------------------------------------------------------------------------

  const router = useRouter();
  const isUpdate = Boolean(initialData.group_id?.trim());

  // --------------------------------------------------------------------------
  // State Management & Constants
  // --------------------------------------------------------------------------

  const [formData, setFormData] = useState<Group>(initialData);
  const [saveStatus, setSaveStatus] = useState<{
    design: 'Positive' | 'Negative';
    message: string;
  } | null>(null);
  const [errors, setErrors] = useState({
    group_id: false,
    description: false,
  });
  const [baseData, setBaseData] = useState<Group>(initialData);

  const isDirty = useMemo(() => {
    return !isEqual(formData, baseData);
  }, [formData, baseData]);

  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------

  const handleSave = async () => {
    setSaveStatus(null);

    // Validation
    const newErrors = {
      group_id: !formData.group_id.trim(),
      description: !formData.description.trim(),
    };

    setErrors(newErrors);

    if (newErrors.group_id || newErrors.description) {
      setSaveStatus({ design: 'Negative', message: 'Please fix validation errors.' });
      return;
    }

    // Execution
    let result: ActionResult;

    if (isUpdate) {
      result = await UpdateGroup(formData.group_id, {
        description: formData.description,
      });
    } else {
      result = await CreateGroup(formData);
    }

    // Response Handling
    if (result.success) {
      setBaseData(formData);
      setSaveStatus({
        design: 'Positive',
        message: `Group ${isUpdate ? 'updated' : 'created'} successfully!`,
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

  const handleGroupIdChange = (e: any) => {
    setFormData({ ...formData, group_id: e.target.value });
    if (errors.group_id) setErrors({ ...errors, group_id: false });
  };

  const handleDescriptionChange = (e: any) => {
    setFormData({ ...formData, description: e.target.value });
    if (errors.description) setErrors({ ...errors, description: false });
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <Page
      noScrolling={true}
      header={
        <Bar
          design="Header"
          style={{ height: '3.5rem' }}
          startContent={
            <>
              <Button
                icon={navBackIcon}
                design="Default"
                onClick={() => router.back()}
              />
              <Title level="H3">{isUpdate ? 'Edit' : 'Create'} Group</Title>
            </>
          }
          endContent={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Button
                design="Emphasized"
                icon={saveIcon}
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
        style={{ width: '100%', height: '100%' }}
        labelSpan="S12 M2 L2 XL1"
        emptySpan="S0 M3 L5 XL7"
        layout="S1 M1 L1 XL1"
      >
        {/* Group ID Field */}
        <FormItem labelContent={<Label required>Group</Label>}>
          <Input
            value={formData.group_id}
            type="Text"
            readonly={isUpdate}
            valueState={errors.group_id ? 'Negative' : 'None'}
            valueStateMessage={<div>Group ID is required.</div>}
            onInput={handleGroupIdChange}
          />
        </FormItem>

        {/* Description Field */}
        <FormItem labelContent={<Label required>Description</Label>}>
          <Input
            value={formData.description || ''}
            valueState={errors.description ? 'Negative' : 'None'}
            valueStateMessage={<div>Description is required.</div>}
            onInput={handleDescriptionChange}
          />
        </FormItem>
      </Form>
    </Page>
  );
}
