import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const entry = await (prisma as any).journalEntry.findUnique({
            where: { id },
        });

        if (!entry) return NextResponse.json({ error: "Journal entry not found" }, { status: 404 });
        if (entry.status === "VOID") {
            return NextResponse.json({ error: "Entry is already void" }, { status: 400 });
        }

        const updated = await (prisma as any).journalEntry.update({
            where: { id },
            data: { status: "VOID" },
            include: { lines: { include: { ledger: true } } },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[POST /api/accounting/journal-entries/[id]/void]", error);
        return NextResponse.json({ error: "Failed to void journal entry" }, { status: 500 });
    }
}
