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
        if (entry.status !== "DRAFT") {
            return NextResponse.json({ error: "Only DRAFT entries can be posted" }, { status: 400 });
        }

        const updated = await (prisma as any).journalEntry.update({
            where: { id },
            data: { status: "POSTED" },
            include: { lines: { include: { ledger: true } } },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[POST /api/accounting/journal-entries/[id]/post]", error);
        return NextResponse.json({ error: "Failed to post journal entry" }, { status: 500 });
    }
}
