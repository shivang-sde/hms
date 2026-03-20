import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { ownershipContractSchema } from "@/lib/validations";

export async function GET() {
    try {
        const contracts = await prisma.ownershipContract.findMany({
            include: { holding: { include: { city: true } } },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(contracts);
    } catch (error) {
        console.error("[GET /api/contracts]", error);
        return NextResponse.json({ error: "Failed to fetch contracts" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const parsed = ownershipContractSchema.parse(body);
        const contract = await prisma.ownershipContract.create({ data: parsed });
        return NextResponse.json(contract, { status: 201 });
    } catch (error: any) {
        console.error("[POST /api/contracts]", error);
        if (error?.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create contract" }, { status: 500 });
    }
}
