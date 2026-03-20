import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { ledgerSchema } from "@/lib/validations";

export async function GET() {
    try {
        const ledgers = await (prisma as any).ledger.findMany({
            orderBy: { name: "asc" },
            include: {
                parent: { select: { id: true, name: true, code: true } },
                children: { select: { id: true, name: true, code: true, type: true, isGroup: true } },
                _count: { select: { journalLines: true } },
            },
        });
        return NextResponse.json(ledgers);
    } catch (error) {
        console.error("[GET /api/accounting/ledgers]", error);
        return NextResponse.json({ error: "Failed to fetch ledgers" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const parsed = ledgerSchema.parse(body);

        const ledger = await (prisma as any).ledger.create({ data: parsed });
        return NextResponse.json(ledger, { status: 201 });
    } catch (error: any) {
        console.error("[POST /api/accounting/ledgers]", error);
        if (error?.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        const msg = error?.message || "Failed to create ledger";
        if (msg.includes("Unique constraint")) {
            return NextResponse.json({ error: "A ledger with this name or code already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
