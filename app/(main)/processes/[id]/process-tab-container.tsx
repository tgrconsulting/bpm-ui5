'use client';

import headerIcon from '@ui5/webcomponents-icons/dist/header';
import itemsIcon from '@ui5/webcomponents-icons/dist/activity-items';
import { TabContainer, Tab, Ui5CustomEvent } from '@ui5/webcomponents-react';
import { ProcessItemsTable } from './processitems-table';
import { ProcessGeneralForm } from './process-general-form';

import { ProcessItem } from './../db-actions';

interface ProcessTabContainerProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: any;
  setErrors: (errors: any) => void;
  isUpdate: boolean;
  availableGroups: any[];
  onTabChange: (tabName: string) => void;
  onEditItem: (item: ProcessItem) => void;
  onDeleteItem: (item: ProcessItem) => void;
}

export function ProcessTabContainer({
  formData,
  setFormData,
  errors,
  setErrors,
  isUpdate,
  availableGroups,
  onTabChange,
  onEditItem,
  onDeleteItem,
}: ProcessTabContainerProps) {
  // Calculate the item count safely
  const itemCount = formData.processItems?.length ?? 0;

  // Handle tab selection and notify parent
  const handleTabSelect = (event: Ui5CustomEvent<any, { tab: HTMLElement }>) => {
    const selectedTabText = event.detail.tab.getAttribute('text');
    if (selectedTabText) {
      onTabChange(selectedTabText);
    }
  };

  return (
    <TabContainer
      onTabSelect={handleTabSelect}
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
        additionalText={itemCount.toString()}
      >
        <div style={{ padding: '1rem' }}>
          <ProcessItemsTable 
            items={formData.processItems || []}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
          />
        </div>
      </Tab>
    </TabContainer>
  );
}
