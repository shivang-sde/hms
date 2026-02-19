import { PrismaClient, OwnerType, RentCycle, BillingCycle, TaskType, Priority, HoldingCondition, MaintenanceType, PaymentMode } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Seeding database...");

    // ─── Users ──────────────────────────────────────────────────────────────────
    const hashedPasswordAdmin = await bcrypt.hash("admin123", 10);
    const hashedPasswordStaff = await bcrypt.hash("staff123", 10);

    const admin = await prisma.user.upsert({
        where: { email: "admin@hms.com" },
        update: {
            password: hashedPasswordAdmin,
            plainPassword: "admin123",
        },
        create: {
            email: "admin@hms.com",
            name: "Admin User",
            password: hashedPasswordAdmin,
            plainPassword: "admin123",
            role: "ADMIN",
        },
    });

    const staff = await prisma.user.upsert({
        where: { email: "staff@hms.com" },
        update: {
            password: hashedPasswordStaff,
            plainPassword: "staff123",
        },
        create: {
            email: "staff@hms.com",
            name: "Staff User",
            password: hashedPasswordStaff,
            plainPassword: "staff123",
            role: "STAFF",
        },
    });
    console.log("  ✅ Users seeded (admin@hms.com / staff@hms.com)");

    // ─── Clean Database ────────────────────────────────────────────────────────
    await prisma.receipt.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.maintenanceRecord.deleteMany();
    await prisma.inspection.deleteMany();
    await prisma.taskExecution.deleteMany();
    await prisma.task.deleteMany();
    await prisma.advertisement.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.ownershipContract.deleteMany();
    await prisma.holding.deleteMany();
    await prisma.client.deleteMany();


    // ─── Cities ─────────────────────────────────────────────────────────────────
    const cities = await Promise.all([
        prisma.city.upsert({
            where: { name_state: { name: "Mumbai", state: "Maharashtra" } },
            update: {},
            create: { name: "Mumbai", state: "Maharashtra" },
        }),
        prisma.city.upsert({
            where: { name_state: { name: "Pune", state: "Maharashtra" } },
            update: {},
            create: { name: "Pune", state: "Maharashtra" },
        }),
        prisma.city.upsert({
            where: { name_state: { name: "Nashik", state: "Maharashtra" } },
            update: {},
            create: { name: "Nashik", state: "Maharashtra" },
        }),
        prisma.city.upsert({
            where: { name_state: { name: "Nagpur", state: "Maharashtra" } },
            update: {},
            create: { name: "Nagpur", state: "Maharashtra" },
        }),
        prisma.city.upsert({
            where: { name_state: { name: "Delhi", state: "Delhi" } },
            update: {},
            create: { name: "Delhi", state: "Delhi" },
        }),
    ]);
    console.log(`  ✅ ${cities.length} cities seeded`);

    // ─── Holding Types ──────────────────────────────────────────────────────────
    const holdingTypes = await Promise.all([
        prisma.holdingType.upsert({
            where: { name: "Billboard" },
            update: {},
            create: { name: "Billboard", description: "Standard outdoor billboard" },
        }),
        prisma.holdingType.upsert({
            where: { name: "Hoarding" },
            update: {},
            create: { name: "Hoarding", description: "Large format hoarding" },
        }),
        prisma.holdingType.upsert({
            where: { name: "Unipole" },
            update: {},
            create: { name: "Unipole", description: "Single pole mounted display" },
        }),
        prisma.holdingType.upsert({
            where: { name: "Gantry" },
            update: {},
            create: { name: "Gantry", description: "Road spanning gantry" },
        }),
        prisma.holdingType.upsert({
            where: { name: "Bus Shelter" },
            update: {},
            create: { name: "Bus Shelter", description: "Bus shelter advertising panel" },
        }),
    ]);
    console.log(`  ✅ ${holdingTypes.length} holding types seeded`);

    // ─── HSN Codes ──────────────────────────────────────────────────────────────
    const hsnCodes = await Promise.all([
        prisma.hsnCode.upsert({
            where: { code: "998365" },
            update: {},
            create: { code: "998365", description: "Outdoor advertising services", gstRate: 18.0 },
        }),
        prisma.hsnCode.upsert({
            where: { code: "998366" },
            update: {},
            create: { code: "998366", description: "Billboard rental services", gstRate: 18.0 },
        }),
        prisma.hsnCode.upsert({
            where: { code: "998361" },
            update: {},
            create: { code: "998361", description: "Advertising agency services", gstRate: 18.0 },
        }),
    ]);
    console.log(`  ✅ ${hsnCodes.length} HSN codes seeded`);

    // ─── Holdings ───────────────────────────────────────────────────────────────
    const holdings = await Promise.all([
        prisma.holding.create({
            data: {
                code: "HLD-MUM-001",
                name: "Western Express Highway Billboard",
                address: "Nr. Goregaon Flyover, Western Express Highway",
                latitude: 19.1663,
                longitude: 72.8496,
                width: 40,
                height: 20,
                totalArea: 800,
                illumination: "LIT",
                facing: "East",
                landmark: "Goregaon Flyover",
                cityId: cities[0].id,
                holdingTypeId: holdingTypes[0].id,
                hsnCodeId: hsnCodes[0].id,
                maintenanceCycle: 90,
            },
        }),
        prisma.holding.create({
            data: {
                code: "HLD-MUM-002",
                name: "Bandra Worli Sea Link Unipole",
                address: "Near Bandra Worli Sea Link Toll",
                latitude: 19.0408,
                longitude: 72.8186,
                width: 30,
                height: 15,
                totalArea: 450,
                illumination: "LIT",
                facing: "South",
                landmark: "Sea Link",
                cityId: cities[0].id,
                holdingTypeId: holdingTypes[2].id,
                hsnCodeId: hsnCodes[0].id,
                maintenanceCycle: 60,
            },
        }),
        prisma.holding.create({
            data: {
                code: "HLD-PUN-001",
                name: "Hinjewadi IT Park Hoarding",
                address: "Rajiv Gandhi Infotech Park, Phase 1",
                latitude: 18.5912,
                longitude: 73.738,
                width: 50,
                height: 25,
                totalArea: 1250,
                illumination: "DIGITAL",
                facing: "North",
                landmark: "Infosys Campus",
                cityId: cities[1].id,
                holdingTypeId: holdingTypes[1].id,
                hsnCodeId: hsnCodes[1].id,
                maintenanceCycle: 45,
            },
        }),
        prisma.holding.create({
            data: {
                code: "HLD-NSK-001",
                name: "Mumbai-Nashik Highway Gantry",
                address: "Nashik Highway, Nr. Sinnar Phata",
                latitude: 19.8629,
                longitude: 73.8398,
                width: 60,
                height: 10,
                totalArea: 600,
                illumination: "NON_LIT",
                facing: "West",
                landmark: "Sinnar Phata",
                cityId: cities[2].id,
                holdingTypeId: holdingTypes[3].id,
                hsnCodeId: hsnCodes[1].id,
                maintenanceCycle: 120,
            },
        }),
        prisma.holding.create({
            data: {
                code: "HLD-DEL-001",
                name: "Connaught Place Bus Shelter",
                address: "Outer Circle, Connaught Place",
                latitude: 28.6315,
                longitude: 77.2167,
                width: 8,
                height: 4,
                totalArea: 32,
                illumination: "LIT",
                facing: "South",
                landmark: "CP Metro Station",
                cityId: cities[4].id,
                holdingTypeId: holdingTypes[4].id,
                hsnCodeId: hsnCodes[0].id,
                maintenanceCycle: 30,
            },
        }),
    ]);
    console.log(`  ✅ ${holdings.length} holdings seeded`);

    // ─── Ownership Contracts ────────────────────────────────────────────────────
    const contracts = await Promise.all([
        prisma.ownershipContract.create({
            data: {
                contractNumber: "OC-2024-001",
                ownerName: "MMRDA",
                ownerType: OwnerType.GOVERNMENT,
                ownerContact: "+91 22 2659 6000",
                ownerEmail: "mmrda@gov.in",
                ownerAddress: "Bandra-Kurla Complex, Mumbai",
                rentAmount: 150000,
                rentCycle: RentCycle.MONTHLY,
                startDate: new Date("2024-01-01"),
                endDate: new Date("2026-12-31"),
                securityDeposit: 500000,
                holdingId: holdings[0].id,
            },
        }),
        prisma.ownershipContract.create({
            data: {
                contractNumber: "OC-2024-002",
                ownerName: "PMC",
                ownerType: OwnerType.MUNICIPAL,
                ownerContact: "+91 20 2550 0000",
                ownerEmail: "pmc@pune.gov.in",
                ownerAddress: "Shivajinagar, Pune",
                rentAmount: 200000,
                rentCycle: RentCycle.QUARTERLY,
                startDate: new Date("2024-06-01"),
                endDate: new Date("2027-05-31"),
                securityDeposit: 800000,
                holdingId: holdings[2].id,
            },
        }),
        prisma.ownershipContract.create({
            data: {
                contractNumber: "OC-2024-003",
                ownerName: "Sharma Properties Pvt. Ltd.",
                ownerType: OwnerType.PRIVATE,
                ownerContact: "+91 98765 43210",
                ownerEmail: "info@sharmaproperties.com",
                ownerAddress: "FC Road, Pune",
                rentAmount: 75000,
                rentCycle: RentCycle.MONTHLY,
                startDate: new Date("2024-03-15"),
                endDate: new Date("2025-03-14"),
                securityDeposit: 225000,
                holdingId: holdings[1].id,
            },
        }),
    ]);
    console.log(`  ✅ ${contracts.length} ownership contracts seeded`);

    // ─── Clients ────────────────────────────────────────────────────────────────
    const clients = await Promise.all([
        prisma.client.create({
            data: {
                name: "Tata Motors Ltd.",
                contactPerson: "Rajesh Kumar",
                email: "rajesh@tatamotors.com",
                phone: "+91 22 6665 8282",
                gstNumber: "27AAACT2727Q1ZG",
                panNumber: "AAACT2727Q",
                address: "Bombay House, Mumbai",
                cityId: cities[0].id,
            },
        }),
        prisma.client.create({
            data: {
                name: "Reliance Industries",
                contactPerson: "Priya Sharma",
                email: "priya@ril.com",
                phone: "+91 22 4478 2000",
                gstNumber: "27AAACR5055K1Z5",
                panNumber: "AAACR5055K",
                address: "Maker Chambers IV, Nariman Point",
                cityId: cities[0].id,
            },
        }),
        prisma.client.create({
            data: {
                name: "Infosys Technologies",
                contactPerson: "Anand Verma",
                email: "anand@infosys.com",
                phone: "+91 80 2852 0261",
                gstNumber: "29AABCI1102R1ZR",
                panNumber: "AABCI1102R",
                address: "Electronics City, Pune Office",
                cityId: cities[1].id,
            },
        }),
    ]);
    console.log(`  ✅ ${clients.length} clients seeded`);

    // ─── Bookings ───────────────────────────────────────────────────────────────
    const bookings = await Promise.all([
        prisma.booking.create({
            data: {
                bookingNumber: "BK-2024-001",
                startDate: new Date("2024-07-01"),
                endDate: new Date("2024-12-31"),
                monthlyRate: 250000,
                totalAmount: 1500000,
                billingCycle: BillingCycle.MONTHLY,
                status: "ACTIVE",
                clientId: clients[0].id,
                holdingId: holdings[0].id,
            },
        }),
        prisma.booking.create({
            data: {
                bookingNumber: "BK-2024-002",
                startDate: new Date("2024-08-01"),
                endDate: new Date("2025-01-31"),
                monthlyRate: 350000,
                totalAmount: 2100000,
                billingCycle: BillingCycle.QUARTERLY,
                status: "ACTIVE",
                clientId: clients[1].id,
                holdingId: holdings[2].id,
            },
        }),
        prisma.booking.create({
            data: {
                bookingNumber: "BK-2024-003",
                startDate: new Date("2024-09-01"),
                endDate: new Date("2025-02-28"),
                monthlyRate: 180000,
                totalAmount: 1080000,
                billingCycle: BillingCycle.MONTHLY,
                status: "CONFIRMED",
                clientId: clients[2].id,
                holdingId: holdings[1].id,
            },
        }),
    ]);
    console.log(`  ✅ ${bookings.length} bookings seeded`);

    // ─── Advertisements ─────────────────────────────────────────────────────────
    const ads = await Promise.all([
        prisma.advertisement.create({
            data: {
                campaignName: "Tata Nexon EV Launch Campaign",
                brandName: "Tata Nexon EV",
                artworkDescription: "New Nexon EV MAX with 465km range",
                freeInstallationDays: 7,
                installationDate: new Date("2024-07-05"),
                status: "ACTIVE",
                bookingId: bookings[0].id,
            },
        }),
        prisma.advertisement.create({
            data: {
                campaignName: "Jio 5G Coverage Expansion",
                brandName: "Jio 5G",
                artworkDescription: "Jio True 5G now in your city",
                freeInstallationDays: 5,
                installationDate: new Date("2024-08-10"),
                status: "ACTIVE",
                bookingId: bookings[1].id,
            },
        }),
    ]);
    console.log(`  ✅ ${ads.length} advertisements seeded`);

    // ─── Tasks ──────────────────────────────────────────────────────────────────
    const tasks = await Promise.all([
        prisma.task.create({
            data: {
                title: "Install Tata Nexon billboard",
                description: "Install new artwork for Tata Nexon EV campaign",
                taskType: TaskType.INSTALLATION,
                priority: Priority.HIGH,
                status: "COMPLETED",
                scheduledDate: new Date("2024-07-05"),
                completedDate: new Date("2024-07-05"),
                assignedTo: { connect: { id: staff.id } },
                estimatedCost: 15000,
                actualCost: 14500,
                holding: { connect: { id: holdings[0].id } },
                advertisement: { connect: { id: ads[0].id } },
            },
        }),
        prisma.task.create({
            data: {
                title: "Q3 Inspection - WEH Billboard",
                description: "Quarterly inspection of Western Express Highway billboard",
                taskType: TaskType.INSPECTION,
                priority: Priority.MEDIUM,
                status: "PENDING",
                scheduledDate: new Date("2025-03-15"),
                assignedTo: { connect: { id: staff.id } },
                estimatedCost: 5000,
                holding: { connect: { id: holdings[0].id } },
            },
        }),
        prisma.task.create({
            data: {
                title: "Maintenance - Hinjewadi Hoarding",
                description: "Scheduled maintenance for digital display",
                taskType: TaskType.MAINTENANCE,
                priority: Priority.HIGH,
                status: "IN_PROGRESS",
                scheduledDate: new Date("2025-02-20"),
                assignedTo: { connect: { id: staff.id } },
                estimatedCost: 25000,
                holding: { connect: { id: holdings[2].id } },
            },
        }),
    ]);
    console.log(`  ✅ ${tasks.length} tasks seeded`);

    // ─── Inspections ────────────────────────────────────────────────────────────
    const inspections = await Promise.all([
        prisma.inspection.create({
            data: {
                inspectionDate: new Date("2024-10-15"),
                inspectorName: "Suresh Patil",
                condition: HoldingCondition.GOOD,
                illuminationOk: true,
                structureOk: true,
                visibilityOk: true,
                remarks: "Billboard in good condition. Minor dust accumulation.",
                holding: { connect: { id: holdings[0].id } },
            },
        }),
        prisma.inspection.create({
            data: {
                inspectionDate: new Date("2024-11-20"),
                inspectorName: "Amit Singh",
                condition: HoldingCondition.FAIR,
                illuminationOk: false,
                structureOk: true,
                visibilityOk: true,
                remarks: "Two LED panels need replacement. Structure intact.",
                holding: { connect: { id: holdings[2].id } },
            },
        }),
    ]);
    console.log(`  ✅ ${inspections.length} inspections seeded`);

    // ─── Maintenance Records ────────────────────────────────────────────────────
    await Promise.all([
        prisma.maintenanceRecord.create({
            data: {
                maintenanceType: MaintenanceType.CLEANING,
                description: "Annual deep cleaning of billboard surface",
                cost: 8000,
                performedDate: new Date("2024-09-01"),
                performedBy: "CleanPro Services",
                holding: { connect: { id: holdings[0].id } },
            },
        }),
        prisma.maintenanceRecord.create({
            data: {
                maintenanceType: MaintenanceType.ELECTRICAL,
                description: "LED panel replacement and wiring check",
                cost: 35000,
                performedDate: new Date("2024-12-01"),
                performedBy: "ElectroFix Team",
                holding: { connect: { id: holdings[2].id } },
            },
        }),
    ]);
    console.log(`  ✅ 2 maintenance records seeded`);

    // ─── Invoices ───────────────────────────────────────────────────────────────
    const invoices = await Promise.all([
        prisma.invoice.create({
            data: {
                invoiceNumber: "INV-2024-001",
                invoiceDate: new Date("2024-07-01"),
                dueDate: new Date("2024-07-30"),
                subtotal: 250000,
                cgstRate: 9,
                sgstRate: 9,
                igstRate: 0,
                cgstAmount: 22500,
                sgstAmount: 22500,
                igstAmount: 0,
                totalAmount: 295000,
                paidAmount: 295000,
                status: "PAID",
                client: { connect: { id: clients[0].id } },
                booking: { connect: { id: bookings[0].id } },
                hsnCode: { connect: { id: hsnCodes[0].id } },
            },
        }),
        prisma.invoice.create({
            data: {
                invoiceNumber: "INV-2024-002",
                invoiceDate: new Date("2024-08-01"),
                dueDate: new Date("2024-08-30"),
                subtotal: 250000,
                cgstRate: 9,
                sgstRate: 9,
                igstRate: 0,
                cgstAmount: 22500,
                sgstAmount: 22500,
                igstAmount: 0,
                totalAmount: 295000,
                paidAmount: 0,
                status: "SENT",
                client: { connect: { id: clients[0].id } },
                booking: { connect: { id: bookings[0].id } },
                hsnCode: { connect: { id: hsnCodes[0].id } },
            },
        }),
        prisma.invoice.create({
            data: {
                invoiceNumber: "INV-2024-003",
                invoiceDate: new Date("2024-08-01"),
                dueDate: new Date("2024-10-30"),
                subtotal: 1050000,
                cgstRate: 9,
                sgstRate: 9,
                igstRate: 0,
                cgstAmount: 94500,
                sgstAmount: 94500,
                igstAmount: 0,
                totalAmount: 1239000,
                paidAmount: 500000,
                status: "PARTIALLY_PAID",
                client: { connect: { id: clients[1].id } },
                booking: { connect: { id: bookings[1].id } },
                hsnCode: { connect: { id: hsnCodes[1].id } },
            },
        }),
    ]);
    console.log(`  ✅ ${invoices.length} invoices seeded`);

    // ─── Receipts ───────────────────────────────────────────────────────────────
    const receipts = await Promise.all([
        prisma.receipt.create({
            data: {
                receiptNumber: "RCT-2024-001",
                receiptDate: new Date("2024-07-15"),
                amount: 295000,
                paymentMode: PaymentMode.NEFT,
                referenceNo: "NEFT-TM-20240715-001",
                client: { connect: { id: clients[0].id } },
                invoice: { connect: { id: invoices[0].id } },
            },
        }),
        prisma.receipt.create({
            data: {
                receiptNumber: "RCT-2024-002",
                receiptDate: new Date("2024-09-01"),
                amount: 500000,
                paymentMode: PaymentMode.RTGS,
                referenceNo: "RTGS-RIL-20240901-001",
                client: { connect: { id: clients[1].id } },
                invoice: { connect: { id: invoices[2].id } },
            },
        }),
    ]);
    console.log(`  ✅ ${receipts.length} receipts seeded`);

    console.log("\n✨ Seeding complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
