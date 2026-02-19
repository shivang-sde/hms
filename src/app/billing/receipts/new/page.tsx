import { ReceiptForm } from "@/components/finance/receipt-form";
import { PageHeader } from "@/components/shared/page-header";
import { getClients } from "@/actions/clients";
import { getInvoices } from "@/actions/finance";
import { Receipt } from "lucide-react";
import { serializePrisma } from "@/lib/utils";

export default async function NewReceiptPage() {
    const [rawClients, rawInvoices] = await Promise.all([
        getClients(),
        getInvoices(),
    ]);

    const clients = serializePrisma(rawClients);
    const invoices = serializePrisma(rawInvoices);

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
