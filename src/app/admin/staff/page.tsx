import { getStaffUsers } from "@/actions/users";
import { StaffList } from "@/components/admin/staff-list";
import { AddStaffModal } from "@/components/admin/add-staff-modal";
import { PageHeader } from "@/components/shared/page-header";
import { Users } from "lucide-react";

export default async function StaffManagementPage() {
    const staff = await getStaffUsers();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Staff Management"
                    description="Manage staff accounts and view their credentials."
                    icon={Users}
                />
                <AddStaffModal />
            </div>

            <StaffList staff={staff as any} />
        </div>
    );
}
