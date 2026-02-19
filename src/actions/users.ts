"use server";

import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getStaffUsers() {
    return await prisma.user.findMany({
        where: {
            role: "STAFF",
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function createStaffUser(data: { name: string; email: string; password: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            plainPassword: data.password, // Store plain password for admin visibility
            role: "STAFF",
        },
    });

    revalidatePath("/admin/staff");
    return user;
}

export async function updateStaffUser(id: string, data: { name?: string; email?: string; password?: string }) {
    const updateData: any = { ...data };

    if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10);
        updateData.plainPassword = data.password;
    }

    const user = await prisma.user.update({
        where: { id },
        data: updateData,
    });

    revalidatePath("/admin/staff");
    return user;
}

export async function deleteStaffUser(id: string) {
    await prisma.user.delete({
        where: { id },
    });

    revalidatePath("/admin/staff");
}
