"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export default function VendorStatementPage() {
    const [vendors, setVendors] = useState<any[]>([]);
    const [selectedVendorId, setSelectedVendorId] = useState("");
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        apiFetch<any[]>("/api/accounting/vendors").then(setVendors);
    }, []);

    const fetchReport = async () => {
        if (!selectedVendorId) return;
        setLoading(true);
        try {
            const data = await apiFetch<any>(`/api/accounting/reports/vendor-statement?vendorId=${selectedVendorId}`);
            setReport(data);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Vendor Statement</h1>
                <p className="text-muted-foreground">Payment history for a specific vendor</p>
            </div>

            <div className="bg-card rounded-xl border shadow-sm p-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-sm font-medium mb-1 block">Vendor</label>
                        <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
                            <SelectTrigger className="max-w-full">
                                <SelectValue placeholder="Select vendor" />
                            </SelectTrigger>
                            <SelectContent>
                                {vendors.map((v: any) => (
                                    <SelectItem key={v.id} value={v.id}>
                                        {v.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={fetchReport} disabled={!selectedVendorId || loading}>
                        <Search className="h-4 w-4 mr-2" />
                        {loading ? "Loading..." : "Generate"}
                    </Button>
                </div>
            </div>

            {report && (
                <>
                    <div className="bg-card rounded-xl border shadow-sm p-6">
                        <div className="grid md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Vendor</p>
                                <p className="font-semibold">{report.vendor?.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="font-semibold">{report.vendor?.phone}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">City</p>
                                <p className="font-semibold">{report.vendor?.city?.name || "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Paid</p>
                                <p className="text-lg font-bold text-primary font-mono">
                                    ₹ {Number(report.totalPaid).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-muted/30 border-b">
                            <h3 className="font-semibold text-sm">Payment History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3">Date</th>
                                        <th className="text-left p-3">Payment #</th>
                                        <th className="text-right p-3">Amount (₹)</th>
                                        <th className="text-left p-3">Mode</th>
                                        <th className="text-left p-3">Cash/Bank A/C</th>
                                        <th className="text-left p-3">Journal #</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.payments?.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No payments found for this vendor
                                            </td>
                                        </tr>
                                    ) : (
                                        report.payments.map((p: any) => (
                                            <tr key={p.id} className="border-b hover:bg-muted/20">
                                                <td className="p-3">{format(new Date(p.paymentDate), "dd MMM yyyy")}</td>
                                                <td className="p-3 font-mono text-xs">{p.paymentNumber}</td>
                                                <td className="p-3 text-right font-mono font-semibold">
                                                    ₹ {Number(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant="outline">{p.paymentMode}</Badge>
                                                </td>
                                                <td className="p-3 text-muted-foreground">{p.cashBankLedger?.name || "—"}</td>
                                                <td className="p-3 font-mono text-xs">{p.journalEntry?.entryNumber || "—"}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
