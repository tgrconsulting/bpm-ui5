import { notFound } from 'next/navigation';
import { ReadProcess, type Process } from '../db-actions';
import ProcessForm from './process-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  let Process: Process | null = null;

  if (id === 'new') {
    Process = { process_id: '', description: '', group_id: '' };
  } else {
    const result = await ReadProcess(id);

    if (result.success && result.data) {
      Process = result.data;
    }
  }

  if (!Process) {
    notFound();
  }

  return <ProcessForm initialData={Process} />;
}
