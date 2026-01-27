'use client';

import headerIcon from '@ui5/webcomponents-icons/dist/header';
import itemsIcon from '@ui5/webcomponents-icons/dist/activity-items';
import {
  TabContainer,
  Tab,
  Form,
  FormItem,
  Input,
  Label,
  ComboBox,
  ComboBoxItem,
  Text,
} from '@ui5/webcomponents-react';

interface ProcessTabContainerProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: any;
  setErrors: (errors: any) => void;
  isUpdate: boolean;
  availableGroups: any[];
}

export function ProcessTabContainer({
  formData,
  setFormData,
  errors,
  setErrors,
  isUpdate,
  availableGroups,
}: ProcessTabContainerProps) {
  return (
    <TabContainer
      style={{ height: '100%' }}
      contentBackgroundDesign="Solid"
    >
      {/* General Tab */}
      <Tab
        text="General"
        icon={headerIcon}
        selected
      >
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
              onInput={(e: any) => {
                setFormData({ ...formData, process_id: e.target.value });
                if (errors.process_id) setErrors({ ...errors, process_id: false });
              }}
            />
          </FormItem>

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
      </Tab>

      {/* Items Tab */}
      <Tab
        text="Items"
        icon={itemsIcon}
      >
        <div style={{ padding: '1rem' }}>
          <Text>Items</Text>
        </div>
      </Tab>
    </TabContainer>
  );
}
