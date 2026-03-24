import { apiFetch } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { VendorForm } from "@/components/accounting/vendor-form";


export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewVendorPage() {
    const [cities, ledgers, contracts] = await Promise.all([
        apiFetch<any[]>("/api/master-data/cities"),
        apiFetch<any[]>("/api/accounting/ledgers"),
        apiFetch<any[]>("/api/contracts"),
    ]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Add Vendor"
                description="Create a new vendor for outgoing payments"
            />
            <div className="bg-card rounded-xl border shadow-sm p-6">
                <VendorForm
                    cities={cities}
                    ledgers={ledgers}
                    ownershipContracts={contracts}
                />
            </div>
        </div>
    );
}
