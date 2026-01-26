import { notFound } from 'next/navigation';
import { ReadGroup, type Group } from '../db-actions';
import GroupForm from './group-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  let Group: Group | null = null;

  if (id === 'new') {
    Group = { group_id: '', description: '' };
  } else {
    const result = await ReadGroup(id);

    if (result.success && result.data) {
      Group = result.data;
    }
  }

  if (!Group) {
    notFound();
  }

  return <GroupForm initialData={Group} />;
}
