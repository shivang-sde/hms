import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { advertisementSchema } from "@/lib/validations";

export async function GET() {
    try {
        const advertisements = await prisma.advertisement.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                booking: {
                    include: {
                        client: true,
                        holding: true,
                    },
                },
            },
        });
        return NextResponse.json(advertisements);
    } catch (error) {
        console.error("[GET /api/advertisements]", error);
        return NextResponse.json({ error: "Failed to fetch advertisements" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const parsed = advertisementSchema.parse(body);

        const booking = await prisma.booking.findUnique({ where: { id: parsed.bookingId } });
        if (!booking) {
            return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
        }

        const advertisement = await prisma.advertisement.create({ data: parsed });

        await prisma.booking.update({
            where: { id: parsed.bookingId },
            data: { status: "ACTIVE" },
        });

        return NextResponse.json(advertisement, { status: 201 });
    } catch (error: any) {
        console.error("[POST /api/advertisements]", error);
        if (error?.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create advertisement" }, { status: 500 });
    }
}
