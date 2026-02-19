import { BookingForm } from "@/components/bookings/booking-form";
import { PageHeader } from "@/components/shared/page-header";
import { getClients } from "@/actions/clients";
import { getHoldings } from "@/actions/holdings";
import { CalendarPlus } from "lucide-react";
import { serializePrisma } from "@/lib/utils";
import { Holding } from "@prisma/client";

export default async function NewBookingPage() {
    const [rawClients, rawHoldings] = await Promise.all([
        getClients(),
        getHoldings(),
    ]);

    const clients = serializePrisma(rawClients);
    const holdings = serializePrisma(rawHoldings);

    const availableHoldings = holdings.filter((holding: Holding) => holding.status === "AVAILABLE");


    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <PageHeader
                title="Create New Booking"
                description="Reserve a holding for a client campaign."
                icon={CalendarPlus}
            />
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                <BookingForm
                    clients={clients}
                    holdings={availableHoldings}
                />
            </div>
        </div>
    );
}
