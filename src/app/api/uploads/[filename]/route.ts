import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { readFile } from "fs/promises";

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
    try {
        const { filename } = await params;
        
        // Prevent path traversal
        const safeFilename = path.basename(filename);
        const filePath = path.join(process.cwd(), "uploads", safeFilename);

        if (!fs.existsSync(filePath)) {
            return new NextResponse("File not found", { status: 404 });
        }

        const buffer = await readFile(filePath);
        
        const ext = path.extname(safeFilename).toLowerCase();
        let mimeType = "application/octet-stream";
        if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
        else if (ext === ".png") mimeType = "image/png";
        else if (ext === ".gif") mimeType = "image/gif";
        else if (ext === ".webp") mimeType = "image/webp";

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": mimeType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Error serving file:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
