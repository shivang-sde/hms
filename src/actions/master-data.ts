"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
    citySchema, type CityFormData,
    holdingTypeSchema, type HoldingTypeFormData,
    hsnCodeSchema, type HsnCodeFormData,
} from "@/lib/validations";

// ─── Cities ───────────────────────────────────────────────────────────────────

export async function getCities() {
    return prisma.city.findMany({ orderBy: { name: "asc" } });
}

export async function createCity(data: CityFormData) {
    const parsed = citySchema.parse(data);
    const city = await prisma.city.create({ data: parsed });
    revalidatePath("/master-data");
    return city;
}

export async function updateCity(id: string, data: CityFormData) {
    const parsed = citySchema.parse(data);
    const city = await prisma.city.update({ where: { id }, data: parsed });
    revalidatePath("/master-data");
    return city;
}

export async function deleteCity(id: string) {
    await prisma.city.update({ where: { id }, data: { isActive: false } });
    revalidatePath("/master-data");
}

// ─── Holding Types ────────────────────────────────────────────────────────────

export async function getHoldingTypes() {
    return prisma.holdingType.findMany({ orderBy: { name: "asc" } });
}

export async function createHoldingType(data: HoldingTypeFormData) {
    const parsed = holdingTypeSchema.parse(data);
    const type = await prisma.holdingType.create({ data: parsed });
    revalidatePath("/master-data");
    return type;
}

export async function updateHoldingType(id: string, data: HoldingTypeFormData) {
    const parsed = holdingTypeSchema.parse(data);
    const type = await prisma.holdingType.update({ where: { id }, data: parsed });
    revalidatePath("/master-data");
    return type;
}

export async function deleteHoldingType(id: string) {
    await prisma.holdingType.update({ where: { id }, data: { isActive: false } });
    revalidatePath("/master-data");
}

// ─── HSN Codes ────────────────────────────────────────────────────────────────

export async function getHsnCodes() {
    return prisma.hsnCode.findMany({ orderBy: { code: "asc" } });
}

export async function createHsnCode(data: HsnCodeFormData) {
    const parsed = hsnCodeSchema.parse(data);
    const hsn = await prisma.hsnCode.create({ data: parsed });
    revalidatePath("/master-data");
    return hsn;
}

export async function updateHsnCode(id: string, data: HsnCodeFormData) {
    const parsed = hsnCodeSchema.parse(data);
    const hsn = await prisma.hsnCode.update({ where: { id }, data: parsed });
    revalidatePath("/master-data");
    return hsn;
}

export async function deleteHsnCode(id: string) {
    await prisma.hsnCode.update({ where: { id }, data: { isActive: false } });
    revalidatePath("/master-data");
}
