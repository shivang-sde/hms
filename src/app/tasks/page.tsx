import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { TaskListColumns } from "@/components/tasks/columns";
import { getTasks } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList } from "lucide-react";
import Link from "next/link";
import { serializePrisma } from "@/lib/utils";
import { auth } from "@/auth";

export default async function TasksPage() {
    const session = await auth();
    const role = session?.user?.role;

    const rawTasks = await getTasks();
    const tasks = serializePrisma(rawTasks);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Tasks"
                    description={role === "STAFF" ? "Your assigned tasks and actions." : "Manage installations, mounting, and maintenance."}
                    icon={ClipboardList}
                />
                {role === "ADMIN" && (
                    <Button asChild>
                        <Link href="/tasks/new">
                            <Plus className="mr-2 h-4 w-4" /> New Task
                        </Link>
                    </Button>
                )}
            </div>
            <div className="bg-card">
                <DataTable
                    columns={TaskListColumns}
                    data={tasks}
                    emptyMessage="No pending tasks found."
                />
            </div>
        </div>
    );
}
