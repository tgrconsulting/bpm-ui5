'use client';

// ============================================================================
// Imports
// ============================================================================

import { Form, FormItem, Input, Label, ComboBox, ComboBoxItem } from '@ui5/webcomponents-react';

// ============================================================================
// Types
// ============================================================================

interface ProcessGeneralFormProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: any;
  setErrors: (errors: any) => void;
  isUpdate: boolean;
  availableGroups: any[];
}

// ============================================================================
// Component
// ============================================================================

export function ProcessGeneralForm({
  formData,
  setFormData,
  errors,
  setErrors,
  isUpdate,
  availableGroups,
}: ProcessGeneralFormProps) {
  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------

  /**
   * Handles group selection from ComboBox.
   *
   * @param {any} e - The selection change event
   * @returns {void}
   */
  const handleGroupChange = (e: any) => {
    const selectedId = e.detail.item ? e.detail.item.text : '';
    setFormData({ ...formData, group_id: selectedId });
    if (errors.group_id) setErrors({ ...errors, group_id: false });
  };

  /**
   * Handles process ID input changes.
   *
   * @param {any} e - The input event
   * @returns {void}
   */
  const handleProcessIdChange = (e: any) => {
    setFormData({ ...formData, process_id: e.target.value });
    if (errors.process_id) setErrors({ ...errors, process_id: false });
  };

  /**
   * Handles description input changes.
   *
   * @param {any} e - The input event
   * @returns {void}
   */
  const handleDescriptionChange = (e: any) => {
    setFormData({ ...formData, description: e.target.value });
    if (errors.description) setErrors({ ...errors, description: false });
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div style={{ padding: '1rem', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <Form
        style={{ height: '100%' }}
        labelSpan="S12 M2 L2 XL1"
        emptySpan="S0 M3 L5 XL7"
        layout="S1 M1 L1 XL1"
      >
        <FormItem labelContent={<Label required>Process</Label>}>
          <Input
            value={formData.process_id}
            readonly={isUpdate}
            valueState={errors.process_id ? 'Negative' : 'None'}
            onInput={handleProcessIdChange}
          />
        </FormItem>

        <FormItem labelContent={<Label required>Group</Label>}>
          <ComboBox
            value={formData.group_id || ''}
            valueState={errors.group_id ? 'Negative' : 'None'}
            onSelectionChange={handleGroupChange}
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

        <FormItem labelContent={<Label required>Description</Label>}>
          <Input
            value={formData.description || ''}
            valueState={errors.description ? 'Negative' : 'None'}
            onInput={handleDescriptionChange}
          />
        </FormItem>
      </Form>
    </div>
  );
}
