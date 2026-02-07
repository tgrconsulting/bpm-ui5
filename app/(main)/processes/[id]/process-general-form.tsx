'use client';

// ============================================================================
// Imports
// ============================================================================

import {
  ComboBox,
  ComboBoxItem,
  Form,
  FormGroup,
  FormItem,
  Input,
  ObjectStatus,
  Label,
  Title,
} from '@ui5/webcomponents-react';

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
  // State Management & Helpers
  // --------------------------------------------------------------------------
  const typeMap: Record<string, string> = {
    S: 'Single',
    D: 'Standard',
    B: 'Batch',
  };
  const processTypeValue = typeMap[formData.process_type] || '';

  /**
   * Status Logic
   * A -> Active (Positive/Green)
   * I -> Inactive (Critical/Orange) - Assuming 'I' for Inactive based on typical patterns
   */
  const isStatusActive = formData.process_status === 'A';
  const statusText = isStatusActive ? 'Active' : 'Inactive';
  const statusState = isStatusActive ? 'Positive' : 'Critical';

  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------

  const handleGroupChange = (e: any) => {
    const selectedId = e.detail.item ? e.detail.item.text : '';
    setFormData({ ...formData, group_id: selectedId });
    if (errors.group_id) setErrors({ ...errors, group_id: false });
  };

  const handleProcessIdChange = (e: any) => {
    setFormData({ ...formData, process_id: e.target.value });
    if (errors.process_id) setErrors({ ...errors, process_id: false });
  };

  const handleDescriptionChange = (e: any) => {
    setFormData({ ...formData, description: e.target.value });
    if (errors.description) setErrors({ ...errors, description: false });
  };

  const handleTypeChange = (e: any) => {
    const selectedText = e.detail.item ? e.target.value : '';
    const typeMapping: Record<string, string> = {
      Single: 'S',
      Batch: 'B',
      Standard: 'D',
    };
    const processCode = typeMapping[selectedText] || '';
    setFormData({ ...formData, process_type: processCode });
    if (errors.process_type) setErrors({ ...errors, process_type: false });
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div style={{ width: '100%' }}>
      <Form
        style={{ height: '100%' }}
        labelSpan="S12 M3 L2 XL1"
        emptySpan="S0 M1 L2 XL4"
        layout="S1 M2 L2 XL2"
      >
        <FormGroup>
          <Title
            level="H3"
            slot="header"
            style={{ paddingBlock: '0.5rem' }}
          >
            General
          </Title>

          <FormItem labelContent={<Label required>Process</Label>}>
            <Input
              value={formData.process_id}
              readonly={isUpdate}
              valueState={errors.process_id ? 'Negative' : 'None'}
              onInput={handleProcessIdChange}
            />
          </FormItem>

          <FormItem labelContent={<Label required>Type</Label>}>
            <ComboBox
              value={processTypeValue || ''}
              valueState={errors.process_type ? 'Negative' : 'None'}
              onSelectionChange={handleTypeChange}
            >
              <ComboBoxItem
                key={'S'}
                text="Single"
              />
              <ComboBoxItem
                key={'D'}
                text="Standard"
              />
              <ComboBoxItem
                key={'B'}
                text="Batch"
              />
            </ComboBox>
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
        </FormGroup>

        <FormGroup>
          <Title
            level="H3"
            slot="header"
            style={{ paddingBlock: '0.5rem' }}
          ></Title>

          <FormItem labelContent={<Label>Status</Label>}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '2.5rem',
              }}
            >
              <ObjectStatus
                showDefaultIcon
                state={statusState}
              >
                {statusText}
              </ObjectStatus>
            </div>
          </FormItem>
        </FormGroup>
      </Form>
    </div>
  );
}
