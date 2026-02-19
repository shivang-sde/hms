import { getStaffUsers } from "@/actions/users";
import { getTask } from "@/actions/tasks";
import { getHoldings } from "@/actions/holdings";
import { getAdvertisements } from "@/actions/advertisements";
import { notFound } from "next/navigation";
import { serializePrisma } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Pencil } from "lucide-react";
import { TaskForm } from "@/components/tasks/task-form";

interface EditTaskPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
    const { id } = await params;
    const [rawTask, rawHoldings, rawAdvertisements, rawStaff] = await Promise.all([
        getTask(id),
        getHoldings(),
        getAdvertisements(),
        getStaffUsers(),
    ]);

    if (!rawTask) {
        notFound();
    }

    const task = serializePrisma(rawTask);
    const holdings = serializePrisma(rawHoldings);
    const advertisements = serializePrisma(rawAdvertisements);
    const staff = serializePrisma(rawStaff);

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <PageHeader
                title={`Edit Task`}
                description="Update task details and status."
                icon={Pencil}
            />
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                <TaskForm
                    initialData={task}
                    holdings={holdings}
                    advertisements={advertisements}
                    staff={staff}
                />
            </div>
        </div>
    );
}
