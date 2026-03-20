import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const vendorId = searchParams.get("vendorId");

        if (!vendorId) {
            return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
        }

        const vendor = await (prisma as any).vendor.findUnique({
            where: { id: vendorId },
            include: { ledger: true, city: true },
        });

        if (!vendor) {
            return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
        }

        const payments = await (prisma as any).payment.findMany({
            where: { vendorId },
            orderBy: { paymentDate: "asc" },
            include: {
                cashBankLedger: { select: { name: true } },
                journalEntry: { select: { entryNumber: true } },
            },
        });

        const totalPaid = payments.reduce(
            (sum: number, p: any) => sum + Number(p.amount),
            0,
        );

        return NextResponse.json({
            vendor,
            payments,
            totalPaid,
        });
    } catch (error) {
        console.error("[GET /api/accounting/reports/vendor-statement]", error);
        return NextResponse.json(
            { error: "Failed to generate vendor statement" },
            { status: 500 },
        );
    }
}
