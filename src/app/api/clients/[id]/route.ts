import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { clientSchema } from "@/lib/validations";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const client = await prisma.client.findUnique({
            where: { id },
            include: {
                city: true,
                bookings: {
                    orderBy: { startDate: "desc" },
                    include: { holding: true },
                },
                invoices: { orderBy: { invoiceDate: "desc" } },
            },
        });
        if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(client);
    } catch (error) {
        console.error("[GET /api/clients/[id]]", error);
        return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const parsed = clientSchema.parse(body);
        const client = await prisma.client.update({ where: { id }, data: parsed });
        return NextResponse.json(client);
    } catch (error: any) {
        console.error("[PUT /api/clients/[id]]", error);
        if (error?.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        await prisma.client.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[DELETE /api/clients/[id]]", error);
        return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
    }
}
