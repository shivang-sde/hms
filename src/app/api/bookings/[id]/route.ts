import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { bookingSchema } from "@/lib/validations";

async function checkAvailability(
    holdingId: string,
    startDate: Date,
    endDate: Date,
    excludeBookingId?: string,
): Promise<boolean> {
    const collisions = await prisma.booking.count({
        where: {
            holdingId,
            status: { in: ["CONFIRMED", "ACTIVE"] },
            id: excludeBookingId ? { not: excludeBookingId } : undefined,
            AND: [{ startDate: { lte: endDate } }, { endDate: { gte: startDate } }],
        },
    });
    return collisions === 0;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                client: true,
                holding: true,
                advertisements: true,
                invoices: true,
            },
        });
        if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(booking);
    } catch (error) {
        console.error("[GET /api/bookings/[id]]", error);
        return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const parsed = bookingSchema.parse(body);

        const isAvailable = await checkAvailability(
            parsed.holdingId,
            parsed.startDate,
            parsed.endDate,
            id,
        );
        if (!isAvailable) {
            return NextResponse.json(
                { error: "Holding is not available for the selected dates." },
                { status: 409 },
            );
        }

        const booking = await prisma.booking.update({ where: { id }, data: parsed });
        return NextResponse.json(booking);
    } catch (error: any) {
        console.error("[PUT /api/bookings/[id]]", error);
        if (error?.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        await prisma.booking.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[DELETE /api/bookings/[id]]", error);
        return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
    }
}
