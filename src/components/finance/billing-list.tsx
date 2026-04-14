"use client";

import { FilterableDataTable } from "@/components/shared/filterable-data-table";
import { InvoiceListColumns, ReceiptListColumns } from "@/components/finance/columns";

const INVOICE_STATUS_OPTIONS = [
    { value: "ALL", label: "All Statuses" },
    { value: "DRAFT", label: "Draft" },
    { value: "SENT", label: "Sent" },
    { value: "PAID", label: "Paid" },
    { value: "PARTIALLY_PAID", label: "Partially Paid" },
    { value: "OVERDUE", label: "Overdue" },
    { value: "CANCELLED", label: "Cancelled" },
];

const PAYMENT_MODE_OPTIONS = [
    { value: "ALL", label: "All Modes" },
    { value: "CASH", label: "Cash" },
    { value: "CHEQUE", label: "Cheque" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "UPI", label: "UPI" },
    { value: "ONLINE", label: "Online" },
];

interface BillingListClientProps {
    type: "invoices" | "receipts";
    data: any[];
}

export function BillingListClient({ type, data }: BillingListClientProps) {
    if (type === "invoices") {
        return (
            <FilterableDataTable
                columns={InvoiceListColumns}
                data={data}
                emptyMessage="No invoices generated yet."
                filteredEmptyMessage="No invoices match your filters."
                searchPlaceholder="Search by invoice #, client..."
                searchFields={[
                    { path: "invoiceNumber" },
                    { path: "client.name" },
                ]}
                filters={[
                    {
                        key: "status",
                        label: "Status",
                        options: INVOICE_STATUS_OPTIONS,
                        accessor: (row: any) => row.status,
                    },
                ]}
            />
        );
    }

    return (
        <FilterableDataTable
            columns={ReceiptListColumns}
            data={data}
            emptyMessage="No payments recorded yet."
            filteredEmptyMessage="No receipts match your filters."
            searchPlaceholder="Search by receipt #, client..."
            searchFields={[
                { path: "receiptNumber" },
                { path: "client.name" },
            ]}
            filters={[
                {
                    key: "paymentMode",
                    label: "Payment Mode",
                    options: PAYMENT_MODE_OPTIONS,
                    accessor: (row: any) => row.paymentMode,
                },
            ]}
        />
    );
}
