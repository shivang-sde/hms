"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { invoiceSchema, receiptSchema, type InvoiceFormData, type ReceiptFormData } from "@/lib/validations";

// ─── Invoices ─────────────────────────────────────────────────────────────────

export async function getInvoices() {
    return prisma.invoice.findMany({
        orderBy: { invoiceDate: "desc" },
        include: {
            client: true,
            booking: {
                include: {
                    holding: true,
                }
            },
        },
    });
}

export async function getInvoice(id: string) {
    return prisma.invoice.findUnique({
        where: { id },
        include: {
            client: true,
            booking: {
                include: {
                    holding: true,
                }
            },
            hsnCode: true,
            receipts: {
                orderBy: { receiptDate: "desc" },
            },
        },
    });
}

export async function createInvoice(data: InvoiceFormData) {
    const parsed = invoiceSchema.parse(data);

    // Auto-generate invoice number if not provided? Schema requires it. 
    // Usually user provides or auto-generated in form.

    const invoice = await prisma.invoice.create({ data: parsed });

    revalidatePath("/billing");
    revalidatePath(`/clients/${parsed.clientId}`);
    revalidatePath(`/bookings/${parsed.bookingId}`);
    return invoice;
}

export async function updateInvoice(id: string, data: InvoiceFormData) {
    const parsed = invoiceSchema.parse(data);
    const invoice = await prisma.invoice.update({
        where: { id },
        data: parsed,
    });

    revalidatePath("/billing");
    revalidatePath(`/billing/invoices/${id}`);
    revalidatePath(`/clients/${parsed.clientId}`);
    return invoice;
}

export async function deleteInvoice(id: string) {
    await prisma.invoice.delete({ where: { id } });
    revalidatePath("/billing");
}

// ─── Receipts ─────────────────────────────────────────────────────────────────

export async function getReceipts() {
    return prisma.receipt.findMany({
        orderBy: { receiptDate: "desc" },
        include: {
            client: true,
            invoice: true,
        },
    });
}

export async function createReceipt(data: ReceiptFormData) {
    const parsed = receiptSchema.parse(data);

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

    revalidatePath("/billing");
    revalidatePath(`/billing/invoices/${parsed.invoiceId}`);
    revalidatePath(`/clients/${parsed.clientId}`);
    return receipt;
}

export async function deleteReceipt(id: string) {
    // When deleting a receipt, strictly we should revert the invoice paid amount.
    // For MVP, letting user manually fix or just delete.
    // Ideally use transaction to revert.

    const receipt = await prisma.receipt.findUnique({ where: { id } });
    if (!receipt) return;

    await prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.findUnique({ where: { id: receipt.invoiceId } });
        if (invoice) {
            let newPaidAmount = Number(invoice.paidAmount) - Number(receipt.amount);
            const totalAmount = Number(invoice.totalAmount);

            let newStatus = invoice.status;
            if (newPaidAmount <= 0) { // Should be 0 usually
                newStatus = "SENT"; // Revert to SENT or whatever.
                if (newPaidAmount < 0) newPaidAmount = 0; // Safety
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

    revalidatePath("/billing");
}
