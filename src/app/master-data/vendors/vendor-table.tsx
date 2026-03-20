"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";

const vendorColumns = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "phone",
        header: "Phone",
    },
    {
        header: "City",
        cell: (row: any) => row.city?.name || "—",
    },
    {
        header: "Contract",
        cell: (row: any) => row.ownershipContract?.contractNumber || "—",
    },
    {
        header: "AP Ledger",
        cell: (row: any) => row.ledger?.name || "—",
    },
    {
        header: "Payments",
        cell: (row: any) => row._count?.payments || 0,
    },
    {
        header: "Status",
        cell: (row: any) => (
            <Badge variant={row.isActive ? "default" : "secondary"}>
                {row.isActive ? "Active" : "Inactive"}
            </Badge>
        ),
    },
    {
        accessorKey: "id",
        header: "",
        cell: (row: any) => (
            <Link href={`/master-data/vendors/${row.id}/edit`}>
                <Button size="sm" variant="ghost">Edit</Button>
            </Link>
        ),
    },
];

export function VendorTable({ vendors }: { vendors: any[] }) {
    return <DataTable columns={vendorColumns} data={vendors} />;
}
