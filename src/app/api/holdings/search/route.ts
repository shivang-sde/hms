import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const q = searchParams.get("q");

        if (!q || q.trim() === "") {
            return NextResponse.json([]);
        }

        const holdings = await prisma.holding.findMany({
            where: {
                OR: [
                    { code: { contains: q, mode: "insensitive" } },
                    { name: { contains: q, mode: "insensitive" } }
                ]
            },
            take: 10,
            select: {
                id: true,
                code: true,
                name: true
            },
            orderBy: { code: "asc" }
        });

        return NextResponse.json(holdings);
    } catch (error) {
        console.error("[GET /api/holdings/search]", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
