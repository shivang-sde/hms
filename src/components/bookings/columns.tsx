"use client";

import { Booking } from "@prisma/client";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
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

export const BookingListColumns = [
    {
        header: "Booking #",
        accessorKey: "bookingNumber",
        className: "font-medium",
    },
    {
        header: "Client",
        cell: (row: any) => row.client ? <a href={`/clients/${row.client.id}`}>{row.client.name}</a> : "N/A",
    },
    {
        header: "Hoarding",
        cell: (row: any) => row.holding ? <a href={`/holdings/${row.holdingId}`}>{row.holding.name} - {row.holding.code}</a> : "N/A",
    },
    {
        header: "Total Mounting",
        cell: (row: any) => row.totalMountings || "0",
    },
    {
        header: "Duration",
        cell: (row: any) => (
            <div className="text-xs text-muted-foreground">
                {formatDate(row.startDate)} - {formatDate(row.endDate)}
            </div>
        ),
    },
    {
        header: "Amount",
        cell: (row: any) => formatCurrency(row.totalAmount.toString()),
        className: "font-medium",
    },
    {
        header: "Status",
        cell: (row: any) => <StatusBadge status={row.status} />,
    },
    {
        header: "Actions",
        cell: (row: any) => <BookingActions booking={row} />,
        className: "text-right",
    },
];

import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";

function BookingActions({ booking }: { booking: Booking }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await apiFetch(`/api/bookings/${booking.id}`, { method: 'DELETE' });
            toast.success("Booking deleted successfully");
            setShowDeleteDialog(false);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete booking");
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
                        <Link href={`/bookings/${booking.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/bookings/${booking.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
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
                title="Delete Booking"
                description={`Are you sure you want to delete booking ${booking.bookingNumber}? This action cannot be undone.`}
            />
        </>
    );
}
