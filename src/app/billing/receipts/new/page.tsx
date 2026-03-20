import { apiFetch } from "@/lib/api";
import { Receipt } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ReceiptForm } from "@/components/finance/receipt-form";

export default async function NewReceiptPage() {
    const [clients, invoices] = await Promise.all([
        apiFetch<any[]>("/api/clients"),
        apiFetch<any[]>("/api/invoices"),
    ]);

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <PageHeader
                title="Record Payment"
                description="Create a payment receipt for an invoice."
                icon={Receipt}
            />
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                <ReceiptForm
                    clients={clients}
                    invoices={invoices}
                />
            </div>
        </div>
    );
}
