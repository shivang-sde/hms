import { getTask } from "@/actions/tasks";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { CompleteTaskForm } from "@/components/tasks/complete-task-form";
import { ClipboardCheck } from "lucide-react";
import { auth } from "@/auth";

interface CompleteTaskPageProps {
    params: {
        id: string;
    };
}

export default async function CompleteTaskPage({ params }: CompleteTaskPageProps) {
    const session = await auth();
    const { id } = await params;

    if (!session || session.user.role !== "STAFF") {
        redirect("/login");
    }

    const task = await getTask(id);

    if (!task) {
        notFound();
    }

    // Security: Ensure staff can only complete tasks assigned to them
    if (task.assignedToId !== session.user.id) {
        redirect("/tasks");
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <PageHeader
                title="Complete Task"
                description={`Submit work proof for: ${task.title}`}
                icon={ClipboardCheck}
            />

            <div className="bg-card p-6 rounded-lg border border-border shadow-sm mb-6">
                <h3 className="font-semibold text-lg mb-2">Task Context</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>
                        <p className="font-medium text-foreground">Type</p>
                        <p className="uppercase tracking-wider text-[10px]">{task.taskType}</p>
                    </div>
                    <div>
                        <p className="font-medium text-foreground">Holding</p>
                        <p>{task.holding?.code}</p>
                    </div>
                    <div>
                        <p className="font-medium text-foreground">Priority</p>
                        <p className="uppercase tracking-wider text-[10px]">{task.priority}</p>
                    </div>
                    <div>
                        <p className="font-medium text-foreground">Assigned Date</p>
                        <p>{task.scheduledDate.toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <CompleteTaskForm taskId={id} />
        </div>
    );
}
