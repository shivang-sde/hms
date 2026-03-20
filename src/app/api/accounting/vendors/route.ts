import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { vendorSchema } from "@/lib/validations";

export async function GET() {
    try {
        const vendors = await (prisma as any).vendor.findMany({
            orderBy: { name: "asc" },
            include: {
                city: true,
                ledger: { select: { id: true, name: true, code: true } },
                ownershipContract: { select: { id: true, contractNumber: true, ownerName: true } },
                _count: { select: { payments: true } },
            },
        });
        return NextResponse.json(vendors);
    } catch (error) {
        console.error("[GET /api/accounting/vendors]", error);
        return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const parsed = vendorSchema.parse(body);

        const vendor = await (prisma as any).vendor.create({
            data: parsed,
            include: { ledger: true },
        });
        return NextResponse.json(vendor, { status: 201 });
    } catch (error: any) {
        console.error("[POST /api/accounting/vendors]", error);
        if (error?.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 });
    }
}
