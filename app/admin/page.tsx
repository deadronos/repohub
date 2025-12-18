import { listProjects } from '@/utils/projects/queries';
import AdminDashboard from '@/components/AdminDashboard';

export default async function AdminPage() {
  const projects = await listProjects();
  return <AdminDashboard initialProjects={projects} />;
}
