"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { invoiceSchema, type InvoiceFormData, receiptSchema, type ReceiptFormData } from "@/lib/validations";

export async function getInvoices() {
    return prisma.invoice.findMany({
        include: {
            client: true,
            booking: { include: { holding: true } },
            hsnCode: true,
            _count: { select: { receipts: true } },
        },
        orderBy: { invoiceDate: "desc" },
    });
}

export async function getInvoice(id: string) {
    return prisma.invoice.findUnique({
        where: { id },
        include: {
            client: true,
            booking: { include: { holding: { include: { city: true } } } },
            hsnCode: true,
            receipts: { orderBy: { receiptDate: "desc" } },
        },
    });
}

export async function createInvoice(data: InvoiceFormData) {
    const parsed = invoiceSchema.parse(data);
    const invoice = await prisma.invoice.create({ data: parsed });
    revalidatePath("/billing");
    return invoice;
}

export async function updateInvoice(id: string, data: InvoiceFormData) {
    const parsed = invoiceSchema.parse(data);
    const invoice = await prisma.invoice.update({ where: { id }, data: parsed });
    revalidatePath("/billing");
    revalidatePath(`/billing/${id}`);
    return invoice;
}

export async function deleteInvoice(id: string) {
    await prisma.invoice.delete({ where: { id } });
    revalidatePath("/billing");
}

// Receipts
export async function getReceipts() {
    return prisma.receipt.findMany({
        include: {
            client: true,
            invoice: true,
        },
        orderBy: { receiptDate: "desc" },
    });
}

export async function createReceipt(data: ReceiptFormData) {
    const parsed = receiptSchema.parse(data);
    const receipt = await prisma.receipt.create({ data: parsed });

    // Update invoice paid amount
    const invoice = await prisma.invoice.findUnique({
        where: { id: parsed.invoiceId },
        include: { receipts: true },
    });

    if (invoice) {
        const totalPaid = invoice.receipts.reduce(
            (sum, r) => sum + Number(r.amount),
            Number(parsed.amount)
        );
        const status =
            totalPaid >= Number(invoice.totalAmount) ? "PAID" :
                totalPaid > 0 ? "PARTIALLY_PAID" : invoice.status;

        await prisma.invoice.update({
            where: { id: parsed.invoiceId },
            data: { paidAmount: totalPaid, status },
        });
    }

    revalidatePath("/billing");
    return receipt;
}

export async function getBillingStats() {
    const invoices = await prisma.invoice.findMany({
        select: { totalAmount: true, paidAmount: true, status: true },
    });

    const totalBilled = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
    const outstanding = totalBilled - totalCollected;
    const overdueCount = invoices.filter(inv => inv.status === "OVERDUE").length;

    return { totalBilled, totalCollected, outstanding, overdueCount };
}
