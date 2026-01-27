'use client';

import headerIcon from '@ui5/webcomponents-icons/dist/header';
import itemsIcon from '@ui5/webcomponents-icons/dist/activity-items';
import { TabContainer, Tab } from '@ui5/webcomponents-react';
import { ProcessItemsTable } from './processitems-table';
import { ProcessGeneralForm } from './process-general-form';

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
  // Calculate the item count safely
  const itemCount = formData.processItems?.length ?? 0;

  return (
    <TabContainer
      style={{
        height: '100%',
        ['--sapGroup_ContentBackground' as any]: '#ffffff',
        ['--sapBackgroundColor' as any]: '#ffffff',
      }}
      contentBackgroundDesign="Solid"
    >
      {/* General Tab */}
      <Tab
        text="General"
        icon={headerIcon}
        selected
      >
        <ProcessGeneralForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          setErrors={setErrors}
          isUpdate={isUpdate}
          availableGroups={availableGroups}
        />
      </Tab>

      {/* Items Tab with Row Count */}
      <Tab
        text="Items"
        icon={itemsIcon}
        additionalText={itemCount.toString()} // Set the row count here
      >
        <ProcessItemsTable items={formData.processItems || []} />
      </Tab>
    </TabContainer>
  );
}
