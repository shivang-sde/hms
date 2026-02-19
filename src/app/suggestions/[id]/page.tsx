import { getSuggestion, acceptSuggestion, rejectSuggestion } from "@/actions/suggestions";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, serializePrisma } from "@/lib/utils";
import { MapPin, Phone, User, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

interface SuggestionDetailsPageProps {
    params: {
        id: string;
    };
}

export default async function SuggestionDetailsPage({ params }: SuggestionDetailsPageProps) {
    const { id } = await params;
    const rawSuggestion = await getSuggestion(id);

    if (!rawSuggestion) {
        notFound();
    }

    const suggestion = serializePrisma(rawSuggestion);

    async function handleAccept() {
        "use server";
        await acceptSuggestion(id);
    }

    async function handleReject() {
        "use server";
        await rejectSuggestion(id);
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <PageHeader
                    title="Location Proposal"
                    description={`Submitted: ${formatDate(suggestion.createdAt)}`}
                    icon={MapPin}
                />
                <div className="flex items-center gap-2">
                    <StatusBadge status={suggestion.status} />
                    {suggestion.status === "PENDING" && (
                        <div className="flex gap-2">
                            <form action={handleReject}>
                                <Button variant="destructive" size="sm">
                                    <XCircle className="mr-2 h-4 w-4" /> Reject
                                </Button>
                            </form>
                            <form action={handleAccept}>
                                <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                    <CheckCircle className="mr-2 h-4 w-4" /> Accept
                                </Button>
                            </form>
                        </div>
                    )}
                    {suggestion.status === "ACCEPTED" && (
                        <Button asChild size="sm">
                            <Link href={`/holdings/new?suggestionId=${suggestion.id}&address=${encodeURIComponent(suggestion.address)}&cityId=${suggestion.cityId}&lat=${suggestion.latitude}&lng=${suggestion.longitude}`}>
                                Convert to Holding <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Location Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div>
                            <p className="text-muted-foreground mb-1">Address</p>
                            <p className="font-medium whitespace-pre-wrap">{suggestion.address}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-muted-foreground mb-1">City</p>
                                <p className="font-medium">{suggestion.city.name}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Landmark</p>
                                <p className="font-medium">{suggestion.landmark || "N/A"}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-muted-foreground mb-1">Latitude</p>
                                <p className="font-medium">{suggestion.latitude || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Longitude</p>
                                <p className="font-medium">{suggestion.longitude || "N/A"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Commercial & Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div>
                            <p className="text-muted-foreground mb-1">Description / Notes</p>
                            <p className="font-medium">{suggestion.description || "No notes provided."}</p>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-muted-foreground mb-1">Proposed Rent</p>
                            <p className="font-bold text-lg text-emerald-600">
                                {suggestion.proposedRent ? formatCurrency(suggestion.proposedRent) : "Negotiable"}
                            </p>
                        </div>
                        <div className="bg-muted p-4 rounded-md space-y-2">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{suggestion.ownerName || "Unknown Owner"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{suggestion.ownerPhone || "No Phone"}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
