import { ensureAdmin } from '@/utils/supabase/auth';
import { listProjects } from '@/utils/projects/queries';
import { createClient } from '@/utils/supabase/server';
import AdminDashboard from '@/components/AdminDashboard';

export default async function AdminPage() {
  const supabase = await createClient();
  await ensureAdmin(supabase, true);

  const projects = await listProjects();
  return <AdminDashboard initialProjects={projects} />;
}
