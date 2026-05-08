"use client";

import { Invoice, Receipt } from "@prisma/client";
import { MoreHorizontal, Eye, Pencil, Trash2, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";

// ─── Invoice Columns ──────────────────────────────────────────────────────────

export const InvoiceListColumns = [
    {
        header: "Inv #",
        accessorKey: "invoiceNumber",
        className: "font-medium",
    },
    {
        header: "Client",
        cell: (row: any) => row.client?.name || "N/A",
    },
    {
        header: "Date",
        cell: (row: any) => formatDate(row.invoiceDate),
    },
    {
        header: "Total",
        cell: (row: any) => formatCurrency(row.totalAmount.toString()),
        className: "font-medium",
    },
    {
        header: "Status",
        cell: (row: any) => <StatusBadge status={row.status} />,
    },
    {
        header: "Actions",
        cell: (row: any) => <InvoiceActions invoice={row} />,
        className: "text-right",
    },
];

import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";

function InvoiceActions({ invoice }: { invoice: Invoice }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const isSentLocked = invoice.status === "SENT";

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await apiFetch(`/api/invoices/${invoice.id}`, { method: 'DELETE' });
            toast.success("Invoice deleted successfully");
            setShowDeleteDialog(false);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete invoice");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/billing/invoices/${invoice.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                        </Link>
                    </DropdownMenuItem>
                    {isSentLocked ? (
                        <DropdownMenuItem disabled>
                            <Pencil className="mr-2 h-4 w-4" /> Edit (Locked - Sent)
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem asChild>
                            <Link href={`/billing/invoices/${invoice.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                        <Link href={`/billing/invoices/${invoice.id}/print`}>
                            <Printer className="mr-2 h-4 w-4" /> Print Invoice
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/billing/invoices/${invoice.id}/annexure`} target="_blank">
                            <Download className="mr-2 h-4 w-4" /> Download Annexure
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onClick={() => setShowDeleteDialog(true)} 
                        className="text-red-600 focus:text-red-600"
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DeleteConfirmationDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                title="Delete Invoice"
                description={`Are you sure you want to delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`}
            />
        </>
    );
}

// ─── Receipt Columns ──────────────────────────────────────────────────────────

export const ReceiptListColumns = [
    {
        header: "Receipt #",
        accessorKey: "receiptNumber",
        className: "font-medium",
    },
    {
        header: "Client",
        cell: (row: any) => row.client?.name || "N/A",
    },
    {
        header: "Date",
        cell: (row: any) => formatDate(row.receiptDate),
    },
    {
        header: "Amount",
        cell: (row: any) => formatCurrency(row.amount.toString()),
        className: "font-medium text-emerald-600",
    },
    {
        header: "Mode",
        accessorKey: "paymentMode",
    },
    {
        header: "Actions",
        cell: (row: any) => <ReceiptActions receipt={row} />,
        className: "text-right",
    },
];

function ReceiptActions({ receipt }: { receipt: Receipt }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await apiFetch(`/api/receipts/${receipt.id}`, { method: 'DELETE' });
            toast.success("Receipt deleted & Invoice reverted");
            setShowDeleteDialog(false);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete receipt");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/billing/receipts/${receipt.id}/print`}>
                            <Printer className="mr-2 h-4 w-4" /> Print Receipt
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onClick={() => setShowDeleteDialog(true)} 
                        className="text-red-600 focus:text-red-600"
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete / Revert
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DeleteConfirmationDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                title="Delete Receipt"
                description={`Are you sure you want to delete receipt ${receipt.receiptNumber}? This will revert the invoice balance and cannot be undone.`}
            />
        </>
    );
}
