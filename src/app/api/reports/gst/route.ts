import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { GstReportRow } from "@/lib/report-types";

const REPORTABLE_INVOICE_STATUSES = ["SENT", "PAID", "PARTIALLY_PAID", "OVERDUE"] as const;

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 },
      );
    }

    const startDate = startOfDay(new Date(`${startDateParam}T00:00:00`));
    const endDate = endOfDay(new Date(`${endDateParam}T00:00:00`));

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date range" },
        { status: 400 },
      );
    }

    const [settings, invoices] = await Promise.all([
      prisma.companySettings.findFirst({
        select: {
          state: true,
        },
      }),
      prisma.invoice.findMany({
        where: {
          status: { in: [...REPORTABLE_INVOICE_STATUSES] },
          invoiceDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: [
          { invoiceDate: "asc" },
          { invoiceNumber: "asc" },
        ],
        select: {
          invoiceNumber: true,
          invoiceDate: true,
          notes: true,
          igstRate: true,
          client: {
            select: {
              name: true,
              gstNumber: true,
              city: {
                select: {
                  state: true,
                },
              },
            },
          },
          items: {
            select: {
              description: true,
              amount: true,
              gstAmount: true,
              hsnCode: {
                select: {
                  code: true,
                },
              },
              booking: {
                select: {
                  holding: {
                    select: {
                      city: {
                        select: {
                          state: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    const companyState = settings?.state?.trim().toLowerCase() || "";

    const rows: GstReportRow[] = invoices.flatMap((invoice) =>
      invoice.items.map((item) => {
        const taxableAmount = Number(item.amount || 0);
        const gstAmount = Number(item.gstAmount || 0);
        const clientState = invoice.client.city?.state?.trim().toLowerCase();
        const holdingState = item.booking?.holding?.city?.state?.trim().toLowerCase();
        const placeOfSupplyState = clientState || holdingState || "";
        const isInterState =
          companyState && placeOfSupplyState
            ? companyState !== placeOfSupplyState
            : Number(invoice.igstRate || 0) > 0;

        return {
          date: format(invoice.invoiceDate, "dd-MM-yyyy"),
          invoiceNumber: invoice.invoiceNumber,
          partyName: invoice.client.name,
          gstin: invoice.client.gstNumber || "",
          description: item.description,
          hsnCode: item.hsnCode?.code || "",
          taxableAmount,
          integratedTax: isInterState ? gstAmount : 0,
          centralTax: isInterState ? 0 : gstAmount / 2,
          stateTax: isInterState ? 0 : gstAmount / 2,
          narration: invoice.notes || item.description,
        };
      }),
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("[GET /api/reports/gst]", error);
    return NextResponse.json(
      { error: "Failed to fetch GST report" },
      { status: 500 },
    );
  }
}
