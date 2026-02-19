"use server";

import { prisma } from "@/lib/db";

export async function getDashboardStats() {
    // 1. Total Holdings
    const totalHoldings = await prisma.holding.count();

    // 2. Total Clients
    const totalClients = await prisma.client.count();

    // 3. Active Bookings (Current Date is within Start and End Date)
    const now = new Date();
    const activeBookings = await prisma.booking.count({
        where: {
            startDate: { lte: now },
            endDate: { gte: now },
            status: { in: ["CONFIRMED", "ACTIVE"] }
        }
    });

    // 4. Monthly Revenue (Sum of Invoices in current month)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyRevenueAgg = await prisma.invoice.aggregate({
        _sum: { totalAmount: true },
        where: {
            invoiceDate: {
                gte: startOfMonth,
                lte: endOfMonth
            },
            status: { not: "CANCELLED" } // Include pending and paid invoices as "Revenue" (Accrual basis)
        }
    });
    const monthlyRevenue = monthlyRevenueAgg._sum.totalAmount ? Number(monthlyRevenueAgg._sum.totalAmount) : 0;

    // 5. Pending Tasks
    const pendingTasks = await prisma.task.count({
        where: { status: { in: ["PENDING", "IN_PROGRESS"] } }
    });

    // 6. Recent Bookings
    const recentBookings = await prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
            client: { select: { name: true } },
            holding: { select: { code: true, name: true } }
        }
    });

    // 7. Expiring Soon (Bookings ending in next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const expiringBookings = await prisma.booking.findMany({
        where: {
            endDate: {
                gte: now,
                lte: nextWeek
            },
            status: { in: ["CONFIRMED", "ACTIVE"] }
        },
        take: 5,
        orderBy: { endDate: "asc" },
        include: {
            client: { select: { name: true } },
            holding: { select: { code: true } }
        }
    });

    return {
        totalHoldings,
        totalClients,
        activeBookings,
        monthlyRevenue,
        pendingTasks,
        recentBookings,
        expiringBookings
    };
}

export async function getStaffStats(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Total tasks completed by this staff member this month
    const tasksCompletedThisMonth = await prisma.task.count({
        where: {
            assignedToId: userId,
            status: "COMPLETED",
            completedDate: {
                gte: startOfMonth
            }
        }
    });

    // 2. Pending tasks assigned to this staff member
    const pendingTasks = await prisma.task.count({
        where: {
            assignedToId: userId,
            status: { in: ["PENDING", "IN_PROGRESS"] }
        }
    });

    // 3. Breakdown by Task Type (for assigned tasks)
    const taskTypeCounts = await prisma.task.groupBy({
        by: ['taskType'],
        where: {
            assignedToId: userId
        },
        _count: {
            id: true
        }
    });

    // 4. Recent tasks assigned
    const recentTasks = await prisma.task.findMany({
        where: {
            assignedToId: userId
        },
        take: 5,
        orderBy: { scheduledDate: "asc" },
        include: {
            holding: { select: { code: true, name: true } }
        }
    });

    return {
        tasksCompletedThisMonth,
        pendingTasks,
        taskTypeCounts,
        recentTasks
    };
}
