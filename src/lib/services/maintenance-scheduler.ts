import { prisma } from "@/lib/db";

export async function scheduleMaintenanceTasks() {
    const today = new Date();

    // Find holdings that need maintenance
    const dueHoldings = await prisma.holding.findMany({
        where: {
            nextMaintenanceDue: {
                lte: today
            },
            status: {
                notIn: ["UNINSTALLED", "INACTIVE"]
            }
        }
    });

    if (dueHoldings.length === 0) {
        return { created: 0, message: "No holdings are due for maintenance." };
    }

    let createdCount = 0;

    for (const holding of dueHoldings) {
        // Check if there's already an active maintenance task to avoid duplicates
        const existingTask = await prisma.task.findFirst({
            where: {
                holdingId: holding.id,
                taskType: "MAINTENANCE",
                status: {
                    in: ["PENDING", "IN_PROGRESS", "UNDER_REVIEW"]
                }
            }
        });

        if (!existingTask) {
            // Create a new Maintenance Task
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7); // Default due date is 7 days from now

            await prisma.task.create({
                data: {
                    title: `Scheduled Maintenance: ${holding.code}`,
                    description: `Automated maintenance task for ${holding.name} (${holding.code}). Please inspect and perform necessary maintenance.`,
                    taskType: "MAINTENANCE",
                    priority: "MEDIUM",
                    status: "PENDING",
                    scheduledDate: dueDate,
                    holdingId: holding.id,
                }
            });
            createdCount++;
        }
    }

    return { created: createdCount, totalDue: dueHoldings.length, message: `Created ${createdCount} maintenance tasks.` };
}
