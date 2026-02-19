import { getDashboardStats, getStaffStats } from "@/actions/dashboard";
import { serializePrisma } from "@/lib/utils";
import { auth } from "@/auth";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { StaffDashboard } from "@/components/dashboard/staff-dashboard";

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role;
  const userId = session?.user?.id;

  if (role === "STAFF" && userId) {
    const rawStats = await getStaffStats(userId);
    const stats = serializePrisma(rawStats);
    return <StaffDashboard stats={stats} />;
  }

  const rawStats = await getDashboardStats();
  const stats = serializePrisma(rawStats);
  return <AdminDashboard stats={stats} />;
}
