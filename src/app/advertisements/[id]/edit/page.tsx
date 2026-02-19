import { AdvertisementForm } from "@/components/advertisements/advertisement-form";
import { PageHeader } from "@/components/shared/page-header";
import { getAdvertisement } from "@/actions/advertisements";
import { getBookings } from "@/actions/bookings";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { serializePrisma } from "@/lib/utils";

interface EditAdvertisementPageProps {
    params: {
        id: string;
    }
}

export default async function EditAdvertisementPage({ params }: EditAdvertisementPageProps) {
    const { id } = await params;
    const [rawAdvertisement, rawBookings] = await Promise.all([
        getAdvertisement(id),
        getBookings(),
    ]);

    if (!rawAdvertisement) {
        notFound();
    }

    const advertisement = serializePrisma(rawAdvertisement);
    const bookings = serializePrisma(rawBookings);



    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <PageHeader
                title="Edit Advertisement"
                description="Update campaign details or status."
                icon={Pencil}
            />
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                <AdvertisementForm
                    initialData={advertisement}
                    bookings={bookings}
                />
            </div>
        </div>
    );
}
