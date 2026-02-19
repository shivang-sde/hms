"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { holdingSchema, type HoldingFormData } from "@/lib/validations";

export async function getHoldings() {
    return prisma.holding.findMany({
        include: {
            city: true,
            holdingType: true,
            hsnCode: true,
            _count: {
                select: {
                    bookings: true,
                    ownershipContracts: true,
                    tasks: true,
                    inspections: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getHolding(id: string) {
    return prisma.holding.findUnique({
        where: { id },
        include: {
            city: true,
            holdingType: true,
            hsnCode: true,
            ownershipContracts: { orderBy: { startDate: "desc" } },
            bookings: {
                include: { client: true },
                orderBy: { startDate: "desc" },
            },
            tasks: { orderBy: { scheduledDate: "desc" }, take: 10 },
            inspections: {
                include: { photos: true },
                orderBy: { inspectionDate: "desc" },
                take: 5,
            },
            maintenanceRecords: { orderBy: { performedDate: "desc" }, take: 5 },
        },
    });
}

export async function createHolding(data: HoldingFormData) {
    const parsed = holdingSchema.parse(data);
    const holding = await prisma.holding.create({ data: parsed });
    revalidatePath("/holdings");
    return holding;
}

export async function updateHolding(id: string, data: HoldingFormData) {
    const parsed = holdingSchema.parse(data);
    const holding = await prisma.holding.update({ where: { id }, data: parsed });
    revalidatePath("/holdings");
    revalidatePath(`/holdings/${id}`);
    return holding;
}

export async function deleteHolding(id: string) {
    await prisma.holding.delete({ where: { id } });
    revalidatePath("/holdings");
}

export async function getHoldingStats() {
    const [total, available, booked, maintenance] = await Promise.all([
        prisma.holding.count(),
        prisma.holding.count({ where: { status: "AVAILABLE" } }),
        prisma.holding.count({ where: { status: "BOOKED" } }),
        prisma.holding.count({ where: { status: "UNDER_MAINTENANCE" } }),
    ]);
    return { total, available, booked, maintenance };
}
