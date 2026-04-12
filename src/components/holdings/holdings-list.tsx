"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/shared/data-table";
import { HoldingListColumns } from "@/components/holdings/columns";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HoldingsListProps {
    holdings: any[];
}

const STATUS_OPTIONS = [
    { value: "ALL", label: "All Statuses" },
    { value: "AVAILABLE", label: "Available" },
    { value: "BOOKED", label: "Booked" },
    { value: "UNDER_MAINTENANCE", label: "Under Maintenance" },
    { value: "INACTIVE", label: "Inactive" },
];

export function HoldingsList({ holdings }: HoldingsListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const filteredHoldings = useMemo(() => {
        let result = holdings;

        // Filter by status
        if (statusFilter !== "ALL") {
            result = result.filter((h) => h.status === statusFilter);
        }

        // Filter by search query across code, name, type, and city
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter((h) => {
                const code = (h.code || "").toLowerCase();
                const name = (h.name || "").toLowerCase();
                const type = (h.holdingType?.name || "").toLowerCase();
                const city = (h.city?.name || "").toLowerCase();
                return (
                    code.includes(query) ||
                    name.includes(query) ||
                    type.includes(query) ||
                    city.includes(query)
                );
            });
        }

        return result;
    }, [holdings, searchQuery, statusFilter]);

    const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "ALL";

    const clearFilters = () => {
        setSearchQuery("");
        setStatusFilter("ALL");
    };

    return (
        <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by code, name, type, or city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] h-10">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-10 px-3 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Results count */}
            {hasActiveFilters && (
                <p className="text-sm text-muted-foreground">
                    Showing {filteredHoldings.length} of {holdings.length} holdings
                </p>
            )}

            {/* Data Table */}
            <div className="bg-card">
                <DataTable
                    columns={HoldingListColumns}
                    data={filteredHoldings}
                    emptyMessage={
                        hasActiveFilters
                            ? "No holdings match your search criteria."
                            : "No holdings found."
                    }
                />
            </div>
        </div>
    );
}
