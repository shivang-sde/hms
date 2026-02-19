import { AdvertisementForm } from "@/components/advertisements/advertisement-form";
import { PageHeader } from "@/components/shared/page-header";
import { getBookings } from "@/actions/bookings";
import { PlusCircle } from "lucide-react";
import { serializePrisma } from "@/lib/utils";
import { Booking } from "@prisma/client";

export default async function NewAdvertisementPage() {
    const rawBookings = await getBookings();
    const bookings = serializePrisma(rawBookings);

    const confirmedBookings = bookings.filter((booking: Booking) => booking.status === "CONFIRMED");

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <PageHeader
                title="Create Advertisement"
                description="Link artwork and creative details to a booking."
                icon={PlusCircle}
            />
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                <AdvertisementForm bookings={confirmedBookings} />
            </div>
        </div>
    );
}
