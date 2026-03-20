import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { locationSuggestionSchema } from "@/lib/validations";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const suggestion = await prisma.locationSuggestion.findUnique({
            where: { id },
            include: { city: true },
        });
        if (!suggestion) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(suggestion);
    } catch (error) {
        console.error("[GET /api/suggestions/[id]]", error);
        return NextResponse.json({ error: "Failed to fetch suggestion" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const parsed = locationSuggestionSchema.parse(body);

        const suggestion = await prisma.locationSuggestion.update({
            where: { id },
            data: parsed,
        });

        return NextResponse.json(suggestion);
    } catch (error: any) {
        console.error("[PUT /api/suggestions/[id]]", error);
        if (error?.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update suggestion" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        await prisma.locationSuggestion.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[DELETE /api/suggestions/[id]]", error);
        return NextResponse.json({ error: "Failed to delete suggestion" }, { status: 500 });
    }
}
