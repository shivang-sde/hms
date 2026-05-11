import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const record = await prisma.maintenanceRecord.findUnique({
            where: { id },
            include: {
                holding: {
                    include: {
                        city: true
                    }
                }
            }
        });
        return NextResponse.json(record);
    } catch (error) {
        console.error("[GET /api/maintenance/[id]]", error);
        return NextResponse.json({ error: "Failed to fetch maintenance record" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        await prisma.maintenanceRecord.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[DELETE /api/maintenance/[id]]", error);
        return NextResponse.json({ error: "Failed to delete maintenance record" }, { status: 500 });
    }
}
