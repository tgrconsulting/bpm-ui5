'use client';

/**
 * Process List Page
 *
 * Provides a searchable, paginated overview of all processes.
 * Supports asynchronous data loading, filtering, and deletion workflows.
 */

import { TABLE_ROW_LIMIT } from '@/lib/constants';
import createIcon from '@ui5/webcomponents-icons/dist/create.js';
import refreshIcon from '@ui5/webcomponents-icons/dist/refresh.js';
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
import { ProcessesTable } from './processes-table';
import { DeleteProcess, ReadProcesses, type Process } from './db-actions';

export default function ProcessPage() {
  const router = useRouter();
  const initialFetched = useRef(false);

  // -- State Management --
  const [data, setData] = useState<Process[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<{ design: 'Positive' | 'Negative'; message: string } | null>(null);

  // -- Data Fetching --
  useEffect(() => {
    if (!initialFetched.current) {
      initialFetched.current = true;
      loadData(true);
    }
  }, []);

  /**
   * Fetches process records from the database.
   * @param isInitial - If true, resets the list; otherwise appends data.
   */
  const loadData = async (isInitial = false) => {
    if (loading) return;
    setLoading(true);

    const offset = isInitial ? 0 : data.length;
    const result = await ReadProcesses(offset, TABLE_ROW_LIMIT);

    if (result.success && result.data) {
      setData((prev) => (isInitial ? result.data!.Process : [...prev, ...result.data!.Process]));
      setHasMore(result.data.hasMore);
    }
    setLoading(false);
  };

  /**
   * Memoized filtration to ensure high performance during search input.
   */
  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data;

    return data.filter(
      (item) => item.process_id.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
    );
  }, [data, searchQuery]);

  // -- Event Handlers --

  /**
   * Orchestrates the deletion confirmation and feedback loop.
   */
  const handleConfirmDelete = async (action: MessageBoxAction | undefined) => {
    if (action === MessageBoxAction.OK && pendingDeleteId) {
      const result = await DeleteProcess(pendingDeleteId);

      if (result.success) {
        setData((prev) => prev.filter((item) => item.process_id !== pendingDeleteId));
        setStatus({ design: 'Positive', message: `Process ${pendingDeleteId} deleted successfully.` });
      } else {
        setStatus({ design: 'Negative', message: result.error || `Failed to delete ${pendingDeleteId}.` });
      }

      setTimeout(() => setStatus(null), 5000);
    }
    setPendingDeleteId(null);
  };

  return (
    <>
      <MessageBox
        open={!!pendingDeleteId}
        onClose={(e: any) => handleConfirmDelete(e?.detail?.action)}
        type="Confirm"
      >
        Are you sure you want to delete Process {pendingDeleteId}?
      </MessageBox>

      <Page
        noScrolling={true}
        backgroundDesign="List"
        header={
          <Bar
            design="Header"
            style={{ height: '3.5rem' }}
            startContent={<Title>Processes</Title>}
            endContent={
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Button
                  icon={refreshIcon}
                  onClick={() => loadData(true)}
                  tooltip="Refresh List"
                />
                <Button
                  design="Emphasized"
                  icon={createIcon}
                  onClick={() => router.push('/processes/new')}
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
              onInput={(e) => setSearchQuery(e.target.value)}
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
          delay={500}
          style={{ width: '100%', height: '100%' }}
        >
          <ProcessesTable
            data={filteredData}
            hasMore={searchQuery ? false : hasMore}
            onLoadMore={() => loadData()}
            onEdit={(id) => router.push(`/processes/${id}`)}
            onDelete={(id) => setPendingDeleteId(id)}
          />
        </BusyIndicator>
      </Page>
    </>
  );
}
