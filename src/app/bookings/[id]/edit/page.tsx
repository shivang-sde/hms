import { BookingForm } from "@/components/bookings/booking-form";
import { PageHeader } from "@/components/shared/page-header";
import { getBooking } from "@/actions/bookings";
import { getClients } from "@/actions/clients";
import { getHoldings } from "@/actions/holdings";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { serializePrisma } from "@/lib/utils";

interface EditBookingPageProps {
    params: {
        id: string;
    };
}

export default async function EditBookingPage({ params }: EditBookingPageProps) {
    const { id } = await params;
    const [rawBooking, rawClients, rawHoldings] = await Promise.all([
        getBooking(id),
        getClients(),
        getHoldings(),
    ]);

    if (!rawBooking) {
        notFound();
    }

    const booking = serializePrisma(rawBooking);
    const clients = serializePrisma(rawClients);
    const holdings = serializePrisma(rawHoldings);

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <PageHeader
                title="Edit Booking"
                description="Update campaign dates or rates."
                icon={Pencil}
            />
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                <BookingForm
                    initialData={booking}
                    clients={clients}
                    holdings={holdings}
                />
            </div>
        </div>
    );
}
