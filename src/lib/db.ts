import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";


// 👇 Create extended client type
type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
    prisma: ExtendedPrismaClient | undefined;
};


function serialize(data: any): any {

    if (data === null || data === undefined)
        return data;

    if (data.constructor?.name === "Decimal")
        return data.toNumber();

    if (data instanceof Date)
        return data.toISOString();

    if (Array.isArray(data))
        return data.map(serialize);

    if (typeof data === "object") {

        const newObj: any = {};

        for (const key in data)
            newObj[key] = serialize(data[key]);

        return newObj;

    }

    return data;
}


function createPrismaClient() {

    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL!,
        max: 20, // Maximum number of clients in the pool (adjust based on your DB max_connections)
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
        allowExitOnIdle: false, // Keep the pool alive even if all clients are idle
    });

    // Optional: Add error handling to prevent crashes on transient DB issues
    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        // Do not exit the process, just log. The pool will try to reconnect.
    });

    const adapter = new PrismaPg(pool);

    return new PrismaClient({
        adapter,
        log: ['warn', 'error']
    }).$extends({

        query: {

            $allOperations: async ({ model, operation, args, query }) => {
                const start = Date.now();

                try {
                    const result = await query(args);
                    const duration = Date.now() - start;

                    // ✅ LOG ONLY SLOW QUERIES (> 500ms)
                    if (duration > 500) {
                        console.warn(
                            `🐢 SLOW QUERY: ${model}.${operation} took ${duration}ms`
                        );
                    }

                    return serialize(result);
                } catch (error) {
                    console.error(`❌ DB ERROR: ${model}.${operation}`, error);
                    throw error;
                }
            },

        },

    });

}


// 👇 now type matches correctly
export const prisma =
    globalForPrisma.prisma ??
    createPrismaClient();


if (process.env.NODE_ENV !== "production") {

    globalForPrisma.prisma = prisma;

}
