import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const entry = await (prisma as any).journalEntry.findUnique({
            where: { id },
            include: {
                lines: {
                    include: {
                        ledger: { select: { id: true, name: true, code: true, type: true } },
                    },
                },
            },
        });
        if (!entry) return NextResponse.json({ error: "Journal entry not found" }, { status: 404 });
        return NextResponse.json(entry);
    } catch (error) {
        console.error("[GET /api/accounting/journal-entries/[id]]", error);
        return NextResponse.json({ error: "Failed to fetch journal entry" }, { status: 500 });
    }
}
