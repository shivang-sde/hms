import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        const receipt = await prisma.receipt.findUnique({ where: { id } });
        if (!receipt) return NextResponse.json({ error: "Not found" }, { status: 404 });

        await prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.findUnique({ where: { id: receipt.invoiceId } });
            if (invoice) {
                let newPaidAmount = Number(invoice.paidAmount) - Number(receipt.amount);
                const totalAmount = Number(invoice.totalAmount);

                let newStatus = invoice.status;
                if (newPaidAmount <= 0) {
                    newStatus = "SENT";
                    if (newPaidAmount < 0) newPaidAmount = 0;
                } else if (newPaidAmount < totalAmount) {
                    newStatus = "PARTIALLY_PAID";
                }

                await tx.invoice.update({
                    where: { id: receipt.invoiceId },
                    data: { paidAmount: newPaidAmount, status: newStatus },
                });
            }
            await tx.receipt.delete({ where: { id } });
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[DELETE /api/receipts/[id]]", error);
        return NextResponse.json({ error: "Failed to delete receipt" }, { status: 500 });
    }
}
