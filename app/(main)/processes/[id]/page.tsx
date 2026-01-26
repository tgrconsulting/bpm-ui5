import { notFound } from 'next/navigation';
import { ReadProcess } from '../db-actions';
import ProcessForm from './process-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  // ReadProcess now handles 'new' by returning an empty process + the groups list
  const result = await ReadProcess(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return <ProcessForm initialData={result.data} />;
}
