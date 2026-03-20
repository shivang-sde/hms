import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!["ACCEPTED", "REJECTED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const suggestion = await prisma.locationSuggestion.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json(suggestion);
    } catch (error) {
        console.error("[PUT /api/suggestions/[id]/status]", error);
        return NextResponse.json({ error: "Failed to update suggestion status" }, { status: 500 });
    }
}
