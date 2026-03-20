import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { invoiceSchema } from "@/lib/validations";

export async function GET() {
    try {
        const invoices = await prisma.invoice.findMany({
            orderBy: { invoiceDate: "desc" },
            include: {
                client: true,
                booking: { include: { holding: true } },
                hsnCode: true,
                _count: { select: { receipts: true } },
            },
        });
        return NextResponse.json(invoices);
    } catch (error) {
        console.error("[GET /api/invoices]", error);
        return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const parsed = invoiceSchema.parse(body);
        const invoice = await prisma.invoice.create({ data: parsed });
        return NextResponse.json(invoice, { status: 201 });
    } catch (error: any) {
        console.error("[POST /api/invoices]", error);
        if (error?.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
    }
}
