import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
    try {
        const records = await prisma.maintenanceRecord.findMany({
            include: { holding: { include: { city: true } } },
            orderBy: { performedDate: "desc" },
        });
        return NextResponse.json(records);
    } catch (error) {
        console.error("[GET /api/maintenance]", error);
        return NextResponse.json({ error: "Failed to fetch maintenance records" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        if (body.performedDate) body.performedDate = new Date(body.performedDate);

        const record = await prisma.maintenanceRecord.create({ data: body });
        return NextResponse.json(record, { status: 201 });
    } catch (error: any) {
        console.error("[POST /api/maintenance]", error);
        return NextResponse.json({ error: "Failed to create maintenance record" }, { status: 500 });
    }
}
