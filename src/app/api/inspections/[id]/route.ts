import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const inspection = await prisma.inspection.findUnique({
            where: { id },
            include: {
                holding: { include: { city: true, holdingType: true } },
                photos: true,
            },
        });
        if (!inspection) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(inspection);
    } catch (error) {
        console.error("[GET /api/inspections/[id]]", error);
        return NextResponse.json({ error: "Failed to fetch inspection" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        await prisma.inspection.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[DELETE /api/inspections/[id]]", error);
        return NextResponse.json({ error: "Failed to delete inspection" }, { status: 500 });
    }
}
