import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { invoiceSchema } from "@/lib/validations";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                client: true,
                booking: { include: { holding: { include: { city: true } } } },
                hsnCode: true,
                receipts: { orderBy: { receiptDate: "desc" } },
            },
        });
        if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(invoice);
    } catch (error) {
        console.error("[GET /api/invoices/[id]]", error);
        return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const parsed = invoiceSchema.parse(body);
        const invoice = await prisma.invoice.update({ where: { id }, data: parsed });
        return NextResponse.json(invoice);
    } catch (error: any) {
        console.error("[PUT /api/invoices/[id]]", error);
        if (error?.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        await prisma.invoice.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[DELETE /api/invoices/[id]]", error);
        return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
    }
}
