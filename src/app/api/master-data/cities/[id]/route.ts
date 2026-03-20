import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { citySchema } from "@/lib/validations";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const parsed = citySchema.parse(body);
        const city = await prisma.city.update({ where: { id }, data: parsed });
        return NextResponse.json(city);
    } catch (error: any) {
        console.error("[PUT /api/master-data/cities/[id]]", error);
        if (error?.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update city" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        // Logical delete by setting isActive to false as per original server action
        await prisma.city.update({ where: { id }, data: { isActive: false } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[DELETE /api/master-data/cities/[id]]", error);
        return NextResponse.json({ error: "Failed to deactivate city" }, { status: 500 });
    }
}
