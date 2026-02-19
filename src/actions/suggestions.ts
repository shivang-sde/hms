"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { locationSuggestionSchema, type LocationSuggestionFormData } from "@/lib/validations";

export async function getSuggestions() {
    return prisma.locationSuggestion.findMany({
        orderBy: { createdAt: "desc" },
        include: { city: true },
    });
}

export async function getSuggestion(id: string) {
    return prisma.locationSuggestion.findUnique({
        where: { id },
        include: { city: true },
    });
}

export async function createSuggestion(data: LocationSuggestionFormData) {
    const parsed = locationSuggestionSchema.parse(data);
    const suggestion = await prisma.locationSuggestion.create({
        data: {
            ...parsed,
            photos: [], // Initialize empty array, photo upload logic to be separate if needed
        },
    });
    revalidatePath("/suggestions");
    return suggestion;
}

export async function updateSuggestion(id: string, data: LocationSuggestionFormData) {
    const parsed = locationSuggestionSchema.parse(data);
    const suggestion = await prisma.locationSuggestion.update({
        where: { id },
        data: {
            ...parsed,
            // photos... if handling
        },
    });
    revalidatePath("/suggestions");
    revalidatePath(`/suggestions/${id}`);
    return suggestion;
}

export async function deleteSuggestion(id: string) {
    await prisma.locationSuggestion.delete({ where: { id } });
    revalidatePath("/suggestions");
}

export async function acceptSuggestion(id: string) {
    await prisma.locationSuggestion.update({
        where: { id },
        data: { status: "ACCEPTED" },
    });
    revalidatePath("/suggestions");
}

export async function rejectSuggestion(id: string) {
    await prisma.locationSuggestion.update({
        where: { id },
        data: { status: "REJECTED" },
    });
    revalidatePath("/suggestions");
}
