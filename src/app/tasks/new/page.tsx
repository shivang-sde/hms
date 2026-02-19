import { TaskForm } from "@/components/tasks/task-form";
import { PageHeader } from "@/components/shared/page-header";
import { getHoldings } from "@/actions/holdings";
import { getAdvertisements } from "@/actions/advertisements";
import { getStaffUsers } from "@/actions/users";
import { ClipboardList } from "lucide-react";
import { serializePrisma } from "@/lib/utils";

export default async function NewTaskPage() {
    const [rawHoldings, rawAdvertisements, rawStaff] = await Promise.all([
        getHoldings(),
        getAdvertisements(),
        getStaffUsers(),
    ]);
    const holdings = serializePrisma(rawHoldings);
    const advertisements = serializePrisma(rawAdvertisements);
    const staff = serializePrisma(rawStaff);

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <PageHeader
                title="Create New Task"
                description="Assign installation or maintenance work."
                icon={ClipboardList}
            />
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                <TaskForm
                    holdings={holdings}
                    advertisements={advertisements}
                    staff={staff}
                />
            </div>
        </div>
    );
}
