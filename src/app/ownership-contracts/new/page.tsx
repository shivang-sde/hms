import { ContractForm } from "@/components/contracts/contract-form";
import { PageHeader } from "@/components/shared/page-header";
import { apiFetch } from "@/lib/api";
import { PlusCircle } from "lucide-react";

export default async function NewContractPage() {
    const holdings = await apiFetch<any[]>("/api/holdings");

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <PageHeader
                title="New Ownership Contract"
                description="Create a new ownership contract for a holding."
                icon={PlusCircle}
            />
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                <ContractForm holdings={holdings} />
            </div>
        </div>
    );
}
