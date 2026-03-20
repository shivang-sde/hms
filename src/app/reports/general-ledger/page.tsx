"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function GeneralLedgerPage() {
    const [ledgers, setLedgers] = useState<any[]>([]);
    const [selectedLedgerId, setSelectedLedgerId] = useState("");
    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        apiFetch<any[]>("/api/accounting/ledgers").then(setLedgers);
    }, []);

    const fetchReport = async () => {
        if (!selectedLedgerId) return;
        setLoading(true);

        const params = new URLSearchParams({ ledgerId: selectedLedgerId });
        if (fromDate) params.append("from", fromDate.toISOString());
        if (toDate) params.append("to", toDate.toISOString());

        try {
            const data = await apiFetch<any>(`/api/accounting/reports/general-ledger?${params}`);
            setReport(data);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const nonGroupLedgers = ledgers.filter((l: any) => !l.isGroup);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">General Ledger</h1>
                <p className="text-muted-foreground">View all transactions for a specific ledger with running balance</p>
            </div>

            <div className="bg-card rounded-xl border shadow-sm p-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-sm font-medium mb-1 block">Ledger</label>
                        <Select value={selectedLedgerId} onValueChange={setSelectedLedgerId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select ledger" />
                            </SelectTrigger>
                            <SelectContent>
                                {nonGroupLedgers.map((l: any) => (
                                    <SelectItem key={l.id} value={l.id}>
                                        {l.code} — {l.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">From</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-[160px]", !fromDate && "text-muted-foreground")}>
                                    {fromDate ? format(fromDate, "dd MMM yyyy") : "Start date"}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={fromDate} onSelect={setFromDate} /></PopoverContent>
                        </Popover>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">To</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-[160px]", !toDate && "text-muted-foreground")}>
                                    {toDate ? format(toDate, "dd MMM yyyy") : "End date"}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={toDate} onSelect={setToDate} /></PopoverContent>
                        </Popover>
                    </div>

                    <Button onClick={fetchReport} disabled={!selectedLedgerId || loading}>
                        <Search className="h-4 w-4 mr-2" />
                        {loading ? "Loading..." : "Generate"}
                    </Button>
                </div>
            </div>

            {report && (
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold">{report.ledger?.name}</h3>
                            <p className="text-xs text-muted-foreground">{report.ledger?.code} — {report.ledger?.type}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">Closing Balance</p>
                            <p className="text-lg font-bold font-mono">
                                ₹ {Number(report.closingBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">Date</th>
                                    <th className="text-left p-3">Entry #</th>
                                    <th className="text-left p-3">Source</th>
                                    <th className="text-left p-3">Description</th>
                                    <th className="text-right p-3">Debit (₹)</th>
                                    <th className="text-right p-3">Credit (₹)</th>
                                    <th className="text-right p-3">Balance (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.lines?.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No transactions found for this period
                                        </td>
                                    </tr>
                                ) : (
                                    report.lines?.map((line: any, idx: number) => (
                                        <tr key={line.id || idx} className="border-b hover:bg-muted/20">
                                            <td className="p-3">{format(new Date(line.journal.entryDate), "dd MMM yyyy")}</td>
                                            <td className="p-3 font-mono text-xs">{line.journal.entryNumber}</td>
                                            <td className="p-3">
                                                <Badge variant="outline" className="text-xs">{line.journal.source}</Badge>
                                            </td>
                                            <td className="p-3">{line.journal.description || "—"}</td>
                                            <td className="p-3 text-right font-mono">
                                                {Number(line.debit) > 0 ? Number(line.debit).toFixed(2) : "—"}
                                            </td>
                                            <td className="p-3 text-right font-mono">
                                                {Number(line.credit) > 0 ? Number(line.credit).toFixed(2) : "—"}
                                            </td>
                                            <td className="p-3 text-right font-mono font-semibold">
                                                {Number(line.runningBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
