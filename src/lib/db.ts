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
    });

    const adapter = new PrismaPg(pool);

    return new PrismaClient({
        adapter,
    }).$extends({

        query: {

            $allOperations: async ({ args, query }) => {

                const result = await query(args);

                return serialize(result);

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
