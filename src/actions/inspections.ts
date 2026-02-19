"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getInspections() {
    return prisma.inspection.findMany({
        include: {
            holding: { include: { city: true } },
            photos: true,
        },
        orderBy: { inspectionDate: "desc" },
    });
}

export async function getInspection(id: string) {
    return prisma.inspection.findUnique({
        where: { id },
        include: {
            holding: { include: { city: true, holdingType: true } },
            photos: true,
        },
    });
}

export async function createInspection(data: {
    inspectionDate: Date;
    inspectorName: string;
    condition: "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "CRITICAL";
    illuminationOk: boolean;
    structureOk: boolean;
    visibilityOk: boolean;
    remarks?: string;
    holdingId: string;
}) {
    const inspection = await prisma.inspection.create({ data });
    revalidatePath("/inspections");
    return inspection;
}

export async function deleteInspection(id: string) {
    await prisma.inspection.delete({ where: { id } });
    revalidatePath("/inspections");
}

// Maintenance Records
export async function getMaintenanceRecords() {
    return prisma.maintenanceRecord.findMany({
        include: {
            holding: { include: { city: true } },
        },
        orderBy: { performedDate: "desc" },
    });
}

export async function createMaintenanceRecord(data: {
    maintenanceType: "PAINTING" | "STRUCTURAL_REPAIR" | "ELECTRICAL" | "CLEANING" | "REPLACEMENT" | "OTHER";
    description: string;
    cost: number;
    performedDate: Date;
    performedBy: string;
    notes?: string;
    holdingId: string;
}) {
    const record = await prisma.maintenanceRecord.create({ data });
    revalidatePath("/maintenance");
    return record;
}

export async function deleteMaintenanceRecord(id: string) {
    await prisma.maintenanceRecord.delete({ where: { id } });
    revalidatePath("/maintenance");
}
