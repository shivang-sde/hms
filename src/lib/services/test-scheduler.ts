import logger from "../logger";

export async function runTestCron() {
    const now = new Date();
    const timestamp = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    console.log(`[CRON TEST] Executed at: ${timestamp}`);
    logger.info(`[CRON TEST] Executed at: ${timestamp}`);

    return {
        timestamp,
        message: "Test cron executed successfully",
        environment: process.env.NODE_ENV
    };
}
