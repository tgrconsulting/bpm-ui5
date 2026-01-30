import { notFound } from 'next/navigation';
import { ReadApplication, type Application } from '../db-actions';
import ApplicationForm from './application-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  let application: Application | null = null;

  if (id === 'new') {
    application = { application_id: '', description: '' };
  } else {
    const result = await ReadApplication(id);

    if (result.success && result.data) {
      application = result.data;
    }
  }

  if (!application) {
    notFound();
  }

  return <ApplicationForm initialData={application} />;
}
