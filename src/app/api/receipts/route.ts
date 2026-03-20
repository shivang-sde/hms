import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { receiptSchema } from "@/lib/validations";

export async function GET() {
    try {
        const receipts = await prisma.receipt.findMany({
            orderBy: { receiptDate: "desc" },
            include: {
                client: true,
                invoice: true,
            },
        });
        return NextResponse.json(receipts);
    } catch (error) {
        console.error("[GET /api/receipts]", error);
        return NextResponse.json({ error: "Failed to fetch receipts" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const parsed = receiptSchema.parse(body);

        const receipt = await prisma.$transaction(async (tx) => {
            // 1. Create Receipt
            const newReceipt = await tx.receipt.create({ data: parsed });

            // 2. Update Invoice Paid Amount & Status
            const invoice = await tx.invoice.findUnique({ where: { id: parsed.invoiceId } });
            if (!invoice) throw new Error("Invoice not found");

            const newPaidAmount = Number(invoice.paidAmount) + parsed.amount;
            const totalAmount = Number(invoice.totalAmount);

            let newStatus = invoice.status;
            if (newPaidAmount >= totalAmount) {
                newStatus = "PAID";
            } else if (newPaidAmount > 0) {
                newStatus = "PARTIALLY_PAID";
            }

            await tx.invoice.update({
                where: { id: parsed.invoiceId },
                data: {
                    paidAmount: newPaidAmount,
                    status: newStatus,
                },
            });

            return newReceipt;
        });

        return NextResponse.json(receipt, { status: 201 });
    } catch (error: any) {
        console.error("[POST /api/receipts]", error);
        if (error?.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || "Failed to create receipt" }, { status: 500 });
    }
}
