import {AdminDashboard} from "@/components/admin/admin-dashboard";
import {requireCurrentAdmin} from "@/lib/auth/current-user";

export const metadata = {title: "医药数字化商务咨询后台"};
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireCurrentAdmin();
  return <AdminDashboard username={admin.username} />;
}
