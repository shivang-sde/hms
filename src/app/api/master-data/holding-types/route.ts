import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { holdingTypeSchema } from "@/lib/validations";

export async function GET() {
    try {
        const types = await prisma.holdingType.findMany({ orderBy: { name: "asc" } });
        return NextResponse.json(types);
    } catch (error) {
        console.error("[GET /api/master-data/holding-types]", error);
        return NextResponse.json({ error: "Failed to fetch holding types" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const parsed = holdingTypeSchema.parse(body);
        const type = await prisma.holdingType.create({ data: parsed });
        return NextResponse.json(type, { status: 201 });
    } catch (error: any) {
        console.error("[POST /api/master-data/holding-types]", error);
        if (error?.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create holding type" }, { status: 500 });
    }
}
