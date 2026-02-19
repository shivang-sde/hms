"use client";

import { Client } from "@prisma/client";
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
import { deleteClient } from "@/actions/clients";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export const ClientListColumns = [
    {
        header: "Name",
        accessorKey: "name",
        className: "font-medium min-w-[150px]",
    },
    {
        header: "Contact Person",
        accessorKey: "contactPerson",
        className: "hidden md:table-cell",
    },
    {
        header: "Phone",
        accessorKey: "phone",
    },
    {
        header: "City",
        cell: (row: any) => row.city?.name || "N/A",
        className: "hidden sm:table-cell",
    },
    {
        header: "Status",
        cell: (row: any) => (
            <div className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                row.isActive
                    ? "border-transparent bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-400"
                    : "border-transparent bg-gray-500/15 text-gray-700 hover:bg-gray-500/25 dark:text-gray-400"
            )}>
                {row.isActive ? "Active" : "Inactive"}
            </div>
        ),
    },
    {
        header: "Actions",
        cell: (row: any) => <ClientActions client={row} />,
        className: "text-right",
    },
];

function ClientActions({ client }: { client: Client }) {
    const router = useRouter();

    const handleDelete = async () => {
        try {
            await deleteClient(client.id);
            toast.success("Client deleted successfully");
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete client");
        }
    };

    return (
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
                    <Link href={`/clients/${client.id}`}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/clients/${client.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
