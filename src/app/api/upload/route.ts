import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), "uploads");
        
        if (!fs.existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const ext = file.name.split(".").pop() || "bin";
        const filename = `${randomUUID()}.${ext}`;
        const filePath = path.join(uploadDir, filename);

        await writeFile(filePath, buffer);

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";
        // Remove trailing slash if present
        const sanitizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        
        const fileUrl = `${sanitizedBaseUrl}/api/uploads/${filename}`;

        return NextResponse.json({ url: fileUrl });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "File upload failed" }, { status: 500 });
    }
}
