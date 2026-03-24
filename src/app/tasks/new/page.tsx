import { TaskForm } from "@/components/tasks/task-form";
import { PageHeader } from "@/components/shared/page-header";
import { apiFetch } from "@/lib/api";
import { ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewTaskPage() {
    const [holdings, advertisements, staff] = await Promise.all([
        apiFetch<any[]>("/api/holdings"),
        apiFetch<any[]>("/api/advertisements"),
        apiFetch<any[]>("/api/users"),
    ]);

    // Filter holdings/ads if needed, though they should ideally be filtered in API if possible.
    // However, the original code had simple filters. Let's keep them if necessary.
    const activeHoldings = holdings.filter((h: any) => h.status === "AVAILABLE");
    const activeAds = advertisements.filter((a: any) => a.status === "ACTIVE");
    const staffMembers = staff.filter((s: any) => s.role === "STAFF");

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <PageHeader
                title="Create New Task"
                description="Assign installation or maintenance work."
                icon={ClipboardList}
            />
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                <TaskForm
                    holdings={activeHoldings}
                    advertisements={activeAds}
                    staff={staffMembers}
                />
            </div>
        </div>
    );
}
