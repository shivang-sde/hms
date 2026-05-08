"use client";

import { ExportButton } from "@/components/shared/export-button";

export function JournalExport({ entries }: { entries: any[] }) {
    const data = entries.map(entry => {
        const totalDebit = entry.lines?.reduce((s: number, l: any) => s + Number(l.debit || 0), 0) || 0;
        const totalCredit = entry.lines?.reduce((s: number, l: any) => s + Number(l.credit || 0), 0) || 0;
        return {
            ...entry,
            totalDebit,
            totalCredit
        };
    });

    return (
        <ExportButton
            title="Journal Entries"
            data={data}
            columns={[
                { header: "Entry #", key: "entryNumber" },
                { header: "Date", key: "entryDate", format: "date" },
                { header: "Source", key: "source" },
                { header: "Description", key: "description" },
                { header: "Debit", key: "totalDebit", format: "currency" },
                { header: "Credit", key: "totalCredit", format: "currency" },
                { header: "Status", key: "status" },
            ]}
        />
    );
}
