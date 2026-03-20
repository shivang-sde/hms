import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const [total, available, booked, maintenance] = await Promise.all([
            prisma.holding.count(),
            prisma.holding.count({ where: { status: "AVAILABLE" } }),
            prisma.holding.count({ where: { status: "BOOKED" } }),
            prisma.holding.count({ where: { status: "UNDER_MAINTENANCE" } }),
        ]);
        return NextResponse.json({ total, available, booked, maintenance });
    } catch (error) {
        console.error("[GET /api/holdings/stats]", error);
        return NextResponse.json({ error: "Failed to fetch holding stats" }, { status: 500 });
    }
}
