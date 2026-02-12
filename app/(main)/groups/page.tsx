'use client';

// =============================================================================
// Imports
// =============================================================================
import { TABLE_ROW_LIMIT } from '@/lib/constants';
import createIcon from '@ui5/webcomponents-icons/dist/create.js';
import '@ui5/webcomponents-icons/dist/delete.js';
import '@ui5/webcomponents-icons/dist/edit.js';
import refreshIcon from '@ui5/webcomponents-icons/dist/refresh.js';
import '@ui5/webcomponents-icons/dist/search.js';
import {
  Bar,
  BusyIndicator,
  Button,
  MessageBox,
  MessageBoxAction,
  MessageStrip,
  Page,
  Search,
  Title,
} from '@ui5/webcomponents-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GroupsTable } from './groups-table';
import { DeleteGroup, ReadGroups, type Group } from './db-actions';

/**
 * GroupsPage Component
 * Provides a searchable, paginated list of Groups with CRUD capabilities.
 */
export default function GroupsPage() {
  // ---------------------------------------------------------------------------
  // Hooks & Constants
  // ---------------------------------------------------------------------------
  const LIMIT = TABLE_ROW_LIMIT;
  const initialFetched = useRef(false);
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // State Management
  // ---------------------------------------------------------------------------
  const [data, setData] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<{ design: 'Positive' | 'Negative'; message: string } | null>(null);

  // ---------------------------------------------------------------------------
  // Side Effects
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!initialFetched.current) {
      initialFetched.current = true;
      loadMoreData(true);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Data Handlers
  // ---------------------------------------------------------------------------

  /**
   * Fetches Groups from the database
   */
  const loadMoreData = async (isInitial = false) => {
    if (loading) return;
    setLoading(true);

    const offset = isInitial ? 0 : data.length;
    const result = await ReadGroups(offset, LIMIT);

    if (result.success && result.data) {
      setData((prev) => (isInitial ? result.data!.Groups : [...prev, ...result.data!.Groups]));
      setHasMore(result.data.hasMore);
    }
    setLoading(false);
  };

  /**
   * Memoized filter logic for client-side search
   */
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter(
      (app) => app.group_id.toLowerCase().includes(lowerQuery) || app.description.toLowerCase().includes(lowerQuery),
    );
  }, [data, searchQuery]);

  // ---------------------------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------------------------

  /**
   * Handles the deletion confirmation flow and status feedback
   */
  const handleClose = async (action: string | undefined) => {
    if (action === MessageBoxAction.OK && pendingDeleteId) {
      const result = await DeleteGroup(pendingDeleteId);

      if (result.success) {
        setData((prev) => prev.filter((app) => app.group_id !== pendingDeleteId));
        setStatus({ design: 'Positive', message: `Group ${pendingDeleteId} deleted successfully.` });
      } else {
        setStatus({ design: 'Negative', message: result.error || `Failed to delete ${pendingDeleteId}.` });
      }

      // Auto-clear status after 5 seconds
      setTimeout(() => setStatus(null), 5000);
    }
    setPendingDeleteId(null);
  };

  // =============================================================================
  // Main Render
  // =============================================================================
  return (
    <>
      <MessageBox
        open={!!pendingDeleteId}
        onClose={handleClose}
        type="Confirm"
      >
        Are you sure you want to delete Group {pendingDeleteId}?
      </MessageBox>

      <Page
        noScrolling={true}
        header={
          <Bar
            design="Header"
            style={{ height: '3.5rem' }}
            startContent={<Title>Groups</Title>}
            endContent={
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Button
                  icon={refreshIcon}
                  onClick={() => loadMoreData(true)}
                  tooltip="Refresh List"
                />
                <Button
                  design="Emphasized"
                  icon={createIcon}
                  onClick={() => router.push('/groups/new')}
                >
                  Create
                </Button>
              </div>
            }
          >
            <Search
              placeholder="Search ID or Description..."
              showClearIcon
              style={{ width: '100%', maxWidth: '400px' }}
              onInput={(e: any) => setSearchQuery(e.target.value)}
              onSearch={(e: any) => setSearchQuery(e.target.value)}
            />
          </Bar>
        }
        footer={
          status && (
            <Bar
              design="Footer"
              style={{ height: 'auto', padding: '0.5rem' }}
            >
              <MessageStrip
                design={status.design}
                onClose={() => setStatus(null)}
                style={{ width: '100%' }}
              >
                {status.message}
              </MessageStrip>
            </Bar>
          )
        }
      >
        <BusyIndicator
          active={loading}
          delay={1000}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              flex: 1,
              alignSelf: 'stretch',
              display: 'block',
            }}
          >
            <GroupsTable
              data={filteredData}
              hasMore={searchQuery ? false : hasMore}
              onLoadMore={() => loadMoreData()}
              onEdit={(id) => router.push(`/groups/${id}`)}
              onDelete={(id) => setPendingDeleteId(id)}
            />
          </div>
        </BusyIndicator>
      </Page>
    </>
  );
}
