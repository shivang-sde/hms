import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const ledgerId = searchParams.get("ledgerId");
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        if (!ledgerId) {
            return NextResponse.json({ error: "ledgerId is required" }, { status: 400 });
        }

        const where: any = {
            ledgerId,
            journal: { status: "POSTED" },
        };

        if (from || to) {
            where.journal.entryDate = {};
            if (from) where.journal.entryDate.gte = new Date(from);
            if (to) where.journal.entryDate.lte = new Date(to);
        }

        const lines = await (prisma as any).journalLine.findMany({
            where,
            orderBy: { journal: { entryDate: "asc" } },
            include: {
                journal: {
                    select: {
                        id: true,
                        entryNumber: true,
                        entryDate: true,
                        description: true,
                        source: true,
                    },
                },
            },
        });

        // Get the ledger info
        const ledger = await (prisma as any).ledger.findUnique({
            where: { id: ledgerId },
        });

        // Compute running balance
        let runningBalance = 0;
        const isNaturalDebit =
            ledger?.type === "ASSET" || ledger?.type === "EXPENSE";

        const enrichedLines = lines.map((line: any) => {
            const debit = Number(line.debit || 0);
            const credit = Number(line.credit || 0);

            if (isNaturalDebit) {
                runningBalance += debit - credit;
            } else {
                runningBalance += credit - debit;
            }

            return {
                ...line,
                runningBalance,
            };
        });

        return NextResponse.json({
            ledger,
            lines: enrichedLines,
            closingBalance: runningBalance,
        });
    } catch (error) {
        console.error("[GET /api/accounting/reports/general-ledger]", error);
        return NextResponse.json({ error: "Failed to generate general ledger report" }, { status: 500 });
    }
}
