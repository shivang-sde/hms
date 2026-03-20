import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const payment = await (prisma as any).payment.findUnique({
            where: { id },
            include: {
                vendor: true,
                cashBankLedger: true,
                journalEntry: {
                    include: {
                        lines: {
                            include: {
                                ledger: { select: { id: true, name: true, code: true } },
                            },
                        },
                    },
                },
            },
        });
        if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        return NextResponse.json(payment);
    } catch (error) {
        console.error("[GET /api/accounting/payments/[id]]", error);
        return NextResponse.json({ error: "Failed to fetch payment" }, { status: 500 });
    }
}
