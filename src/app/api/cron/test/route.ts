import { NextRequest, NextResponse } from "next/server";
import { runTestCron } from "@/lib/services/test-scheduler";

export async function GET(request: NextRequest) {
    // Validate cron secret
    const authHeader = request.headers.get("authorization");
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await runTestCron();
        return NextResponse.json({ success: true, ...result });
    } catch (error: any) {
        console.error("[CRON Test Error]", error);
        return NextResponse.json({ success: false, error: "Failed to execute test cron." }, { status: 500 });
    }
}
