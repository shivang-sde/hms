import { InvoiceForm } from "@/components/finance/invoice-form";
import { PageHeader } from "@/components/shared/page-header";
import { getClients } from "@/actions/clients";
import { getBookings } from "@/actions/bookings";
import { getHsnCodes } from "@/actions/master-data";
import { FileText } from "lucide-react";
import { serializePrisma } from "@/lib/utils";

export default async function NewInvoicePage() {
    const [rawClients, rawBookings, rawHsnCodes] = await Promise.all([
        getClients(),
        getBookings(),
        getHsnCodes(),
    ]);

    const clients = serializePrisma(rawClients);
    const bookings = serializePrisma(rawBookings);
    const hsnCodes = serializePrisma(rawHsnCodes);

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <PageHeader
                title="Generate Invoice"
                description="Create a tax invoice for a client booking."
                icon={FileText}
            />
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                <InvoiceForm
                    clients={clients}
                    bookings={bookings}
                    hsnCodes={hsnCodes}
                />
            </div>
        </div>
    );
}
