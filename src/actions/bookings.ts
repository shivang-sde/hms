"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { bookingSchema, type BookingFormData } from "@/lib/validations";

export async function getBookings() {
    return prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            client: true,
            holding: true,
        },
    });
}

export async function getBooking(id: string) {
    return prisma.booking.findUnique({
        where: { id },
        include: {
            client: true,
            holding: true,
            advertisements: true,
            invoices: true,
        },
    });
}

export async function checkAvailability(holdingId: string, startDate: Date, endDate: Date, excludeBookingId?: string) {
    const collisions = await prisma.booking.count({
        where: {
            holdingId,
            status: { in: ["CONFIRMED", "ACTIVE"] },
            id: excludeBookingId ? { not: excludeBookingId } : undefined,
            AND: [
                { startDate: { lte: endDate } },
                { endDate: { gte: startDate } }
            ]
        }
    });
    return collisions === 0;
}

export async function createBooking(data: BookingFormData) {
    const parsed = bookingSchema.parse(data);

    // Check availability
    const isAvailable = await checkAvailability(parsed.holdingId, parsed.startDate, parsed.endDate);
    if (!isAvailable) {
        throw new Error("Holding is not available for the selected dates.");
    }

    // Determine status based on dates. If start date is today or past, mark as ACTIVE?
    // Or keep as CONFIRMED until manually activated? 
    // Let's stick to user provided status, defaulting to CONFIRMED.

    const booking = await prisma.booking.create({ data: parsed });

    // Update holding status if needed? 
    // Usually holding status "BOOKED" is a current state. 
    // We can update it if the booking is currently active.
    await prisma.holding.update({
        where: { id: parsed.holdingId },
        data: { status: "BOOKED" },
    });

    revalidatePath("/bookings");
    revalidatePath(`/holdings/${parsed.holdingId}`);
    return booking;
}

export async function updateBooking(id: string, data: BookingFormData) {
    const parsed = bookingSchema.parse(data);

    // Check availability (excluding current booking)
    const isAvailable = await checkAvailability(parsed.holdingId, parsed.startDate, parsed.endDate, id);
    if (!isAvailable) {
        throw new Error("Holding is not available for the selected dates.");
    }

    const booking = await prisma.booking.update({
        where: { id },
        data: parsed,
    });

    revalidatePath("/bookings");
    revalidatePath(`/bookings/${id}`);
    revalidatePath(`/holdings/${parsed.holdingId}`);
    return booking;
}

export async function deleteBooking(id: string) {
    await prisma.booking.delete({ where: { id } });
    revalidatePath("/bookings");
}
