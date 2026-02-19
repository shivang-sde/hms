import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { InvoiceListColumns, ReceiptListColumns } from "@/components/finance/columns";
import { getInvoices, getReceipts } from "@/actions/finance";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, FileText } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { serializePrisma } from "@/lib/utils";

export default async function BillingPage() {
    const [rawInvoices, rawReceipts] = await Promise.all([
        getInvoices(),
        getReceipts(),
    ]);

    const invoices = serializePrisma(rawInvoices);
    const receipts = serializePrisma(rawReceipts);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Finance & Billing"
                    description="Professional invoicing and payment records."
                    icon={Receipt}
                />
                <div className="flex gap-4">
                    <Button asChild variant="outline">
                        <Link href="/billing/receipts/new">
                            <Plus className="mr-2 h-4 w-4" /> Record Payment
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/billing/invoices/new">
                            <Plus className="mr-2 h-4 w-4" /> Generate Invoice
                        </Link>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="invoices" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="invoices" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Invoices
                    </TabsTrigger>
                    <TabsTrigger value="receipts" className="flex items-center gap-2">
                        <Receipt className="h-4 w-4" /> Payment Receipts
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="invoices" className="bg-card rounded-md border shadow-sm">
                    <DataTable
                        columns={InvoiceListColumns}
                        data={invoices}
                        emptyMessage="No invoices generated yet."
                    />
                </TabsContent>

                <TabsContent value="receipts" className="bg-card rounded-md border shadow-sm">
                    <DataTable
                        columns={ReceiptListColumns}
                        data={receipts}
                        emptyMessage="No payments recorded yet."
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
