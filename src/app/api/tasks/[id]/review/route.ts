import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: taskId } = await params;
        const body = await request.json();
        const { action, reason } = body;

        if (action !== "APPROVE" && action !== "REJECT") {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                advertisement: {
                    select: { bookingId: true },
                },
                executions: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                }
            },
        });

        if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
        if (task.status !== "UNDER_REVIEW") {
            return NextResponse.json({ error: "Task is not under review" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            let updatedTask;
            let updatedBooking = null;
            const latestExecution = task.executions[0];

            if (action === "APPROVE") {
                // Update task to COMPLETED
                updatedTask = await tx.task.update({
                    where: { id: taskId },
                    data: {
                        status: "COMPLETED",
                        completedDate: new Date(),
                    },
                });

                // Mark the execution as COMPLETED
                if (latestExecution && latestExecution.status === "UNDER_REVIEW") {
                    await tx.taskExecution.update({
                        where: { id: latestExecution.id },
                        data: { status: "COMPLETED" },
                    });
                }

                // If this is MOUNTING task being COMPLETED, increment counts
                if (task.taskType === "MOUNTING" && task.advertisement?.bookingId) {
                    updatedBooking = await (tx as any).booking.update({
                        where: { id: task.advertisement.bookingId },
                        data: { totalMountings: { increment: 1 } },
                    });
                }
            } else if (action === "REJECT") {
                // Determine new notes with rejection reason
                const notePrefix = `\n\n--- [REJECTED on ${new Date().toLocaleDateString()}] ---\nReason: ${reason}`;
                const newNotes = task.notes ? `${task.notes}${notePrefix}` : notePrefix.trim();

                // Update task to PENDING
                updatedTask = await tx.task.update({
                    where: { id: taskId },
                    data: {
                        status: "PENDING",
                        notes: newNotes,
                    },
                });

                // Revert completed date if it was set
                if (task.completedDate) {
                    await tx.task.update({
                        where: { id: taskId },
                        data: { completedDate: null },
                    });
                }

                // Mark the latest execution as REJECTED/CANCELLED so it's clear
                if (latestExecution && latestExecution.status === "UNDER_REVIEW") {
                    await tx.taskExecution.update({
                        where: { id: latestExecution.id },
                        data: { status: "CANCELLED" },
                    });
                }
            }

            return { updatedTask, updatedBooking };
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[POST /api/tasks/[id]/review]", error);
        return NextResponse.json({ error: "Failed to review task" }, { status: 500 });
    }
}
