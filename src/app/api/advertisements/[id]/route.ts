import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { advertisementSchema } from "@/lib/validations";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const advertisement = await prisma.advertisement.findUnique({
            where: { id },
            include: {
                booking: {
                    include: {
                        client: true,
                        holding: true,
                    },
                },
                tasks: { orderBy: { createdAt: "desc" } },
            },
        });

        if (!advertisement) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(advertisement);
    } catch (error) {
        console.error("[GET /api/advertisements/[id]]", error);
        return NextResponse.json({ error: "Failed to fetch advertisement" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const parsed = advertisementSchema.parse(body);

        const advertisement = await prisma.advertisement.update({ where: { id }, data: parsed });
        return NextResponse.json(advertisement);
    } catch (error: any) {
        console.error("[PUT /api/advertisements/[id]]", error);
        if (error?.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update advertisement" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        await prisma.advertisement.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[DELETE /api/advertisements/[id]]", error);
        return NextResponse.json({ error: "Failed to delete advertisement" }, { status: 500 });
    }
}
