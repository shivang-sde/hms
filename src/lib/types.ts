type TrialBalanceRow = {
    ledgerId: string;
    ledgerName: string;
    ledgerCode: string;
    ledgerType: "ASSET" | "LIABILITY" | "INCOME" | "EXPENSE" | "EQUITY";
    parentName: string | null;
    totalDebit: number;
    totalCredit: number;
    debitBalance: number;
    creditBalance: number;
};