"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ownershipContractSchema, type OwnershipContractFormData } from "@/lib/validations";

export async function getContracts() {
    return prisma.ownershipContract.findMany({
        include: {
            holding: { include: { city: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getContract(id: string) {
    return prisma.ownershipContract.findUnique({
        where: { id },
        include: {
            holding: { include: { city: true, holdingType: true } },
        },
    });
}

export async function createContract(data: OwnershipContractFormData) {
    const parsed = ownershipContractSchema.parse(data);
    const contract = await prisma.ownershipContract.create({ data: parsed });
    revalidatePath("/contracts");
    return contract;
}

export async function updateContract(id: string, data: OwnershipContractFormData) {
    const parsed = ownershipContractSchema.parse(data);
    const contract = await prisma.ownershipContract.update({ where: { id }, data: parsed });
    revalidatePath("/contracts");
    revalidatePath(`/contracts/${id}`);
    return contract;
}

export async function deleteContract(id: string) {
    await prisma.ownershipContract.delete({ where: { id } });
    revalidatePath("/contracts");
}
