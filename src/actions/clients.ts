"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { clientSchema, type ClientFormData } from "@/lib/validations";

export async function getClients() {
    return prisma.client.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            city: true,
            _count: {
                select: {
                    bookings: true,
                    invoices: true,
                },
            },
        },
    });
}

export async function getClient(id: string) {
    return prisma.client.findUnique({
        where: { id },
        include: {
            city: true,
            bookings: {
                orderBy: { startDate: "desc" },
                take: 5,
                include: {
                    holding: true,
                }
            },
            invoices: {
                orderBy: { invoiceDate: "desc" },
                take: 5,
            },
        },
    });
}

export async function createClient(data: ClientFormData) {
    const parsed = clientSchema.parse(data);
    const client = await prisma.client.create({ data: parsed });
    revalidatePath("/clients");
    return client;
}

export async function updateClient(id: string, data: ClientFormData) {
    const parsed = clientSchema.parse(data);
    const client = await prisma.client.update({
        where: { id },
        data: parsed,
    });
    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);
    return client;
}

export async function deleteClient(id: string) {
    await prisma.client.delete({ where: { id } });
    revalidatePath("/clients");
}
