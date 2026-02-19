"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { advertisementSchema, type AdvertisementFormData } from "@/lib/validations";

export async function getAdvertisements() {
    return prisma.advertisement.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            booking: {
                include: {
                    client: true,
                    holding: true,
                }
            },
        },
    });
}

export async function getAdvertisement(id: string) {
    return prisma.advertisement.findUnique({
        where: { id },
        include: {
            booking: {
                include: {
                    client: true,
                    holding: true,
                }
            },
            tasks: {
                orderBy: { createdAt: "desc" },
            },
        },
    });
}

export async function createAdvertisement(data: AdvertisementFormData) {
    const parsed = advertisementSchema.parse(data);

    // Ensure booking exists
    const booking = await prisma.booking.findUnique({
        where: { id: parsed.bookingId },
    });
    if (!booking) {
        throw new Error("Invalid booking ID");
    }

    const advertisement = await prisma.advertisement.create({ data: parsed });

    await prisma.booking.update({
        where: { id: parsed.bookingId },
        data: { status: "ACTIVE" },
    });

    revalidatePath("/advertisements");
    revalidatePath(`/bookings/${parsed.bookingId}`);
    return advertisement;
}

export async function updateAdvertisement(id: string, data: AdvertisementFormData) {
    const parsed = advertisementSchema.parse(data);
    const advertisement = await prisma.advertisement.update({
        where: { id },
        data: parsed,
    });

    revalidatePath("/advertisements");
    revalidatePath(`/advertisements/${id}`);
    revalidatePath(`/bookings/${parsed.bookingId}`);
    return advertisement;
}

export async function deleteAdvertisement(id: string) {
    await prisma.advertisement.delete({ where: { id } });
    revalidatePath("/advertisements");
}
