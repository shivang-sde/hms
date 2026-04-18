import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        console.log("Starting data migration...");

        return await prisma.$transaction(async (tx) => {

            // 1. Ensure Sundry Creditors exists
            let creditorsGroup = await tx.ledger.findFirst({
                where: { name: "Sundry Creditors", isGroup: true }
            });

            if (!creditorsGroup) {
                creditorsGroup = await tx.ledger.create({
                    data: {
                        name: "Sundry Creditors",
                        code: "SC-GROUP",
                        type: "LIABILITY",
                        isGroup: true,
                        isPayable: true
                    }
                });
            }

            const contracts = await tx.ownershipContract.findMany();

            let processed = 0;

            for (const contract of contracts) {

                let assignedVendorId = contract.vendorId;

                // --------------------------------------------------
                // STEP 1: Resolve Vendor
                // --------------------------------------------------
                if (!assignedVendorId) {

                    // Try existing mapping
                    const linkedVendor = await tx.vendor.findFirst({
                        where: { ownershipContractId: contract.id },
                        select: { id: true }
                    });

                    if (linkedVendor) {
                        assignedVendorId = linkedVendor.id;
                    } else {

                        // --------------------------------------------------
                        // STEP 2: Create Ledger (idempotent)
                        // --------------------------------------------------
                        const ledgerCode = `VND-${contract.contractNumber}`;

                        let existingLedger = await tx.ledger.findFirst({
                            where: { code: ledgerCode }
                        });

                        if (!existingLedger) {
                            existingLedger = await tx.ledger.create({
                                data: {
                                    name: `Vendor ${contract.contractNumber} - A/c`,
                                    code: ledgerCode,
                                    type: "LIABILITY",
                                    isGroup: false,
                                    isPayable: true,
                                    parentId: creditorsGroup.id
                                }
                            });
                        }

                        // --------------------------------------------------
                        // STEP 3: Create Vendor (idempotent)
                        // --------------------------------------------------
                        let existingVendor = await tx.vendor.findFirst({
                            where: { ledgerId: existingLedger.id }
                        });

                        if (!existingVendor) {
                            existingVendor = await tx.vendor.create({
                                data: {
                                    name: `Vendor ${contract.contractNumber}`,
                                    phone: "0000000000",
                                    email: null,
                                    address: "Migrated Vendor",
                                    isActive: true,
                                    ledgerId: existingLedger.id,
                                    kycDocumentUrl: null
                                }
                            });
                        }

                        assignedVendorId = existingVendor.id;

                        console.log(
                            `Created vendor ${existingVendor.name} for contract ${contract.contractNumber}`
                        );
                    }

                    // Update contract safely
                    await tx.ownershipContract.update({
                        where: { id: contract.id },
                        data: { vendorId: assignedVendorId }
                    });
                }

                // --------------------------------------------------
                // STEP 4: Link Holding → Vendor (ONLY IF EMPTY)
                // --------------------------------------------------
                const holding = await tx.holding.findUnique({
                    where: { id: contract.holdingId },
                    select: { vendorId: true }
                });

                if (!holding?.vendorId) {
                    await tx.holding.update({
                        where: { id: contract.holdingId },
                        data: {
                            vendorId: assignedVendorId,
                            assetType: "RENTED"
                        }
                    });
                }

                processed++;
            }

            // --------------------------------------------------
            // STEP 5: Mark remaining holdings as OWNED
            // --------------------------------------------------
            await tx.holding.updateMany({
                where: { vendorId: null },
                data: { assetType: "OWNED" }
            });

            console.log("Migration complete!");

            return NextResponse.json({
                success: true,
                processed
            });

        });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json(
            { error: e.message },
            { status: 500 }
        );
    }
}