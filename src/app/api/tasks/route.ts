import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { taskSchema } from "@/lib/validations";

export async function GET() {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const role = session.user?.role;
        const userId = session.user?.id;

        const tasks = await prisma.task.findMany({
            where: role === "STAFF" ? { assignedToId: userId } : {},
            orderBy: { createdAt: "desc" },
            include: {
                holding: true,
                advertisement: true,
                assignedTo: { select: { name: true } },
            },
        });
        return NextResponse.json(tasks);
    } catch (error) {
        console.error("[GET /api/tasks]", error);
        return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const parsed = taskSchema.parse(body);

        const { assignedTo, holdingId, advertisementId, completedDate, ...otherData } = parsed;

        const task = await prisma.task.create({
            data: {
                ...otherData,
                assignedToId: assignedTo || null,
                holdingId: holdingId || null,
                advertisementId: advertisementId || null,
                completedDate: completedDate || null,
            },
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error: any) {
        console.error("[POST /api/tasks]", error);
        if (error?.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    }
}
