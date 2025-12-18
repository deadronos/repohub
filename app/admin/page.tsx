import { createClient } from '@/utils/supabase/server';
import AdminDashboard from '@/components/AdminDashboard';
import type { Project } from '@/types';

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  return <AdminDashboard initialProjects={(projects as Project[]) || []} />;
}
