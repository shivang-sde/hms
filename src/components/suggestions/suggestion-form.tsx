"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { locationSuggestionSchema, type LocationSuggestionFormData } from "@/lib/validations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createSuggestion, updateSuggestion } from "@/actions/suggestions";
import { City } from "@prisma/client";

interface SuggestionFormProps {
    initialData?: {
        id: string;
        address: string;
        cityId: string;
        description: string | null;
        latitude: any;
        longitude: any;
        landmark: string | null;
        ownerName: string | null;
        ownerPhone: string | null;
        proposedRent: any;
        status: string;
    };
    cities: City[];
}

export function SuggestionForm({ initialData, cities }: SuggestionFormProps) {
    const router = useRouter();

    const defaultValues: Partial<LocationSuggestionFormData> = initialData
        ? {
            address: initialData.address,
            cityId: initialData.cityId,
            description: initialData.description || undefined,
            latitude: initialData.latitude ? Number(initialData.latitude) : undefined,
            longitude: initialData.longitude ? Number(initialData.longitude) : undefined,
            landmark: initialData.landmark || undefined,
            ownerName: initialData.ownerName || undefined,
            ownerPhone: initialData.ownerPhone || undefined,
            proposedRent: initialData.proposedRent ? Number(initialData.proposedRent) : undefined,
            status: initialData.status as "PENDING" | "ACCEPTED" | "REJECTED",
        }
        : {
            address: "",
            cityId: "",
            status: "PENDING",
            proposedRent: 0,
        };

    const form = useForm<LocationSuggestionFormData>({
        resolver: zodResolver(locationSuggestionSchema) as any,
        defaultValues: defaultValues as any,
    });

    const onSubmit = async (data: LocationSuggestionFormData) => {
        try {
            if (initialData) {
                await updateSuggestion(initialData.id, data);
                toast.success("Suggestion updated successfully");
            } else {
                await createSuggestion(data);
                toast.success("Suggestion submitted successfully");
            }
            router.push("/suggestions");
            router.refresh();
        } catch (error) {
            toast.error("Failed to save suggestion");
            console.error(error);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Address / New Location</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="123, Main Street, Terrace of..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="cityId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>City</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select city" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {cities.map((city) => (
                                            <SelectItem key={city.id} value={city.id}>
                                                {city.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="landmark"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Landmark</FormLabel>
                                <FormControl>
                                    <Input placeholder="Near Clock Tower" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="latitude"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Latitude</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="longitude"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Longitude</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="proposedRent"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Proposed Rent (₹)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Details / Notes</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="High visibility area, owner interested..." {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="col-span-2 border-t pt-4">
                        <p className="font-semibold text-sm mb-4">Owner / Contact Details</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="ownerName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Owner Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Mr. Sharma" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ownerPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Owner Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="9876543210" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        Submit Suggestion
                    </Button>
                </div>
            </form>
        </Form>
    );
}
