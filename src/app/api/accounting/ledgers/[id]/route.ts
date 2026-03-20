import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { ledgerSchema } from "@/lib/validations";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const ledger = await (prisma as any).ledger.findUnique({
            where: { id },
            include: {
                parent: true,
                children: {
                    include: {
                        _count: { select: { journalLines: true } },
                    },
                },
                _count: { select: { journalLines: true } },
            },
        });
        if (!ledger) return NextResponse.json({ error: "Ledger not found" }, { status: 404 });
        return NextResponse.json(ledger);
    } catch (error) {
        console.error("[GET /api/accounting/ledgers/[id]]", error);
        return NextResponse.json({ error: "Failed to fetch ledger" }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const parsed = ledgerSchema.parse(body);

        const ledger = await (prisma as any).ledger.update({ where: { id }, data: parsed });
        return NextResponse.json(ledger);
    } catch (error: any) {
        console.error("[PUT /api/accounting/ledgers/[id]]", error);
        if (error?.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update ledger" }, { status: 500 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        // Check if ledger has transactions
        const count = await (prisma as any).journalLine.count({ where: { ledgerId: id } });
        if (count > 0) {
            return NextResponse.json(
                { error: "Cannot delete ledger with existing transactions" },
                { status: 400 },
            );
        }

        await (prisma as any).ledger.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[DELETE /api/accounting/ledgers/[id]]", error);
        return NextResponse.json({ error: "Failed to delete ledger" }, { status: 500 });
    }
}
