"use client";

import { ExportButton } from "@/components/shared/export-button";

export function TrialBalanceExport({ data }: { data: any }) {
    return (
        <ExportButton
            title="Trial Balance"
            data={[
                ...data.rows,
                { 
                    ledgerName: "TOTAL", 
                    debitBalance: data.totals.debit, 
                    creditBalance: data.totals.credit 
                }
            ]}
            columns={[
                { header: "Code", key: "ledgerCode" },
                { header: "Ledger Name", key: "ledgerName" },
                { header: "Type", key: "ledgerType" },
                { header: "Parent Group", key: "parentName" },
                { header: "Debit (Dr)", key: "debitBalance", format: "currency" },
                { header: "Credit (Cr)", key: "creditBalance", format: "currency" },
            ]}
        />
    );
}
