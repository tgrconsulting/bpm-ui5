'use client';

// ============================================================================
// Imports
// ============================================================================

import headerIcon from '@ui5/webcomponents-icons/dist/header';
import itemsIcon from '@ui5/webcomponents-icons/dist/activity-items';
import { TabContainer, Tab, Ui5CustomEvent } from '@ui5/webcomponents-react';

import { ProcessItemsTable } from './processitems-table';
import { ProcessGeneralForm } from './process-general-form';
import { ProcessEvent } from '../db-actions';

// ============================================================================
// Types
// ============================================================================

interface ProcessTabContainerProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: any;
  setErrors: (errors: any) => void;
  isUpdate: boolean;
  availableGroups: any[];
  onTabChange: (tabName: string) => void;
  onEditItem: (item: ProcessEvent) => void;
  onDeleteItem: (item: ProcessEvent) => void;
}

// ============================================================================
// Component
// ============================================================================

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
  // --------------------------------------------------------------------------
  // State & Variables
  // --------------------------------------------------------------------------

  // Calculate the event count safely
  const eventCount = formData.processItems?.length ?? 0;

  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------

  /**
   * Handles tab selection and notifies parent of active tab.
   *
   * @param {Ui5CustomEvent<any, { tab: HTMLElement }>} event - The tab selection event
   * @returns {void}
   */
  const handleTabSelect = (event: Ui5CustomEvent<any, { tab: HTMLElement }>) => {
    const selectedTabText = event.detail.tab.getAttribute('text');
    if (selectedTabText) {
      onTabChange(selectedTabText);
    }
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

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

      {/* Events Tab with Row Count */}
      <Tab
        text="Events"
        icon={itemsIcon}
        additionalText={eventCount.toString()}
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
