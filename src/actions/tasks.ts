"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { taskSchema, taskExecutionSchema, type TaskFormData, type TaskExecutionFormData } from "@/lib/validations";
import { auth } from "@/auth";

export async function getTasks() {
    const session = await auth();
    const role = session?.user?.role;
    const userId = session?.user?.id;

    return prisma.task.findMany({
        where: role === "STAFF" ? { assignedToId: userId } : {},
        orderBy: { scheduledDate: "asc" },
        include: {
            holding: true,
            advertisement: true,
            assignedTo: { select: { name: true } }
        },
    });
}

export async function getTask(id: string) {
    return prisma.task.findUnique({
        where: { id },
        include: {
            holding: true,
            advertisement: true,
            executions: {
                include: {
                    performedBy: { select: { name: true } }
                },
                orderBy: { createdAt: "desc" }
            },
            assignedTo: { select: { name: true } }
        },
    });
}

export async function createTask(data: TaskFormData) {
    const parsed = taskSchema.parse(data);

    // Ensure either holding or advertisement is provided if relevant context needed
    // But schema says optional.

    const { assignedTo, holdingId, advertisementId, completedDate, ...otherData } = parsed;

    const task = await prisma.task.create({
        data: {
            ...otherData,
            assignedToId: assignedTo || null,
            holdingId: holdingId || null,
            advertisementId: advertisementId || null,
            completedDate: completedDate || null,
        }
    });

    revalidatePath("/tasks");
    if (parsed.holdingId) revalidatePath(`/holdings/${parsed.holdingId}`);
    if (parsed.advertisementId) revalidatePath(`/advertisements/${parsed.advertisementId}`);
    return task;
}

export async function updateTask(id: string, data: TaskFormData) {
    const parsed = taskSchema.parse(data);
    const { assignedTo, holdingId, advertisementId, completedDate, ...otherData } = parsed;

    const task = await prisma.task.update({
        where: { id },
        data: {
            ...otherData,
            assignedToId: assignedTo || null,
            holdingId: holdingId || null,
            advertisementId: advertisementId || null,
            completedDate: completedDate || null,
        },
    });

    revalidatePath("/tasks");
    revalidatePath(`/tasks/${id}`);
    if (parsed.holdingId) revalidatePath(`/holdings/${parsed.holdingId}`);
    return task;
}

export async function deleteTask(id: string) {
    await prisma.task.delete({ where: { id } });
    revalidatePath("/tasks");
}

export async function submitTaskExecution(data: TaskExecutionFormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const parsed = taskExecutionSchema.parse(data);

    const execution = await prisma.$transaction(async (tx) => {
        // 1. Create task execution record
        const exec = await tx.taskExecution.create({
            data: {
                taskId: parsed.taskId,
                performedById: session.user.id,
                status: parsed.status,
                condition: parsed.condition,
                remarks: parsed.remarks,
                latitude: parsed.latitude,
                longitude: parsed.longitude,
                frontViewUrl: parsed.frontViewUrl,
                leftViewUrl: parsed.leftViewUrl,
                rightViewUrl: parsed.rightViewUrl,
            }
        });

        // 2. Update task status
        await tx.task.update({
            where: { id: parsed.taskId },
            data: {
                status: parsed.status,
                completedDate: parsed.status === "COMPLETED" ? new Date() : null,
            }
        });

        // 3. Update holding status if it's an inspection or maintenance and status is reported
        const task = await tx.task.findUnique({
            where: { id: parsed.taskId },
            select: { holdingId: true }
        });

        if (task?.holdingId) {
            // Mapping condition to holding status if needed, but for now we update based on user request?
            // User said: "staff has to mention the status of hoaldings duch as condition good/damaged/ removed"
            // Let's stick to the schema's HoldingCondition and HoldingStatus
        }

        return exec;
    });

    revalidatePath("/tasks");
    revalidatePath(`/tasks/${parsed.taskId}`);
    return execution;
}
