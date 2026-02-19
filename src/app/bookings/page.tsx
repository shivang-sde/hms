import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { BookingListColumns } from "@/components/bookings/columns";
import { getBookings } from "@/actions/bookings";
import { Button } from "@/components/ui/button";
import { Plus, CalendarClock } from "lucide-react";
import Link from "next/link";
import { serializePrisma } from "@/lib/utils";

export default async function BookingsPage() {
    const rawBookings = await getBookings();
    const bookings = serializePrisma(rawBookings);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Bookings"
                    description="Manage campaign schedules and reservations."
                    icon={CalendarClock}
                />
                <Button asChild>
                    <Link href="/bookings/new">
                        <Plus className="mr-2 h-4 w-4" /> New Booking
                    </Link>
                </Button>
            </div>
            <div className="bg-card">
                <DataTable
                    columns={BookingListColumns}
                    data={bookings}
                    emptyMessage="No bookings found."
                />
            </div>
        </div>
    );
}
