import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
    try {
        const inspections = await prisma.inspection.findMany({
            include: {
                holding: { include: { city: true } },
                photos: true,
            },
            orderBy: { inspectionDate: "desc" },
        });
        return NextResponse.json(inspections);
    } catch (error) {
        console.error("[GET /api/inspections]", error);
        return NextResponse.json({ error: "Failed to fetch inspections" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        // Parse date field
        if (body.inspectionDate) body.inspectionDate = new Date(body.inspectionDate);

        const inspection = await prisma.inspection.create({ data: body });
        return NextResponse.json(inspection, { status: 201 });
    } catch (error: any) {
        console.error("[POST /api/inspections]", error);
        return NextResponse.json({ error: "Failed to create inspection" }, { status: 500 });
    }
}
