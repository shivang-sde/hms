import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const invoices = await prisma.invoice.findMany({
            select: { totalAmount: true, paidAmount: true, status: true },
        });

        const totalBilled = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
        const totalCollected = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
        const outstanding = totalBilled - totalCollected;
        const overdueCount = invoices.filter((inv) => inv.status === "OVERDUE").length;

        return NextResponse.json({ totalBilled, totalCollected, outstanding, overdueCount });
    } catch (error) {
        console.error("[GET /api/billing/stats]", error);
        return NextResponse.json({ error: "Failed to fetch billing stats" }, { status: 500 });
    }
}
