"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
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
import { holdingSchema, type HoldingFormData } from "@/lib/validations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getCurrentLocation } from "@/lib/geolocation";
import { City, HoldingType, HsnCode, Holding } from "@prisma/client";

interface HoldingFormProps {
    initialData?: Partial<Holding>; // Changed from Holding to Partial<Holding> to support pre-filling from Suggestions
    cities: City[];
    types: HoldingType[];
    hsnCodes: HsnCode[];
}

export function HoldingForm({ initialData, cities, types, hsnCodes }: HoldingFormProps) {
    const router = useRouter();
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    const fetchCurrentLocation = async () => {
        setIsFetchingLocation(true);
        try {
            const { latitude, longitude } = await getCurrentLocation();
            form.setValue("latitude", latitude);
            form.setValue("longitude", longitude);
            toast.success("Location fetched successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch location");
        } finally {
            setIsFetchingLocation(false);
        }
    };

    const defaultValues: Partial<HoldingFormData> = initialData
        ? {
            code: initialData.code || "",
            name: initialData.name || "",
            address: initialData.address || "",
            width: initialData.width ? Number(initialData.width) : 0,
            height: initialData.height ? Number(initialData.height) : 0,
            totalArea: initialData.totalArea ? Number(initialData.totalArea) : 0,
            latitude: initialData.latitude ? Number(initialData.latitude) : ("" as any),
            longitude: initialData.longitude ? Number(initialData.longitude) : ("" as any),
            illumination: (initialData.illumination as "LIT" | "NON_LIT" | "DIGITAL") || "NON_LIT",
            status: (initialData.status as "AVAILABLE" | "BOOKED" | "UNDER_MAINTENANCE" | "INACTIVE") || "AVAILABLE",
            maintenanceCycle: initialData.maintenanceCycle || 90,
            cityId: initialData.cityId || "",
            holdingTypeId: initialData.holdingTypeId || "",
            hsnCodeId: initialData.hsnCodeId || "",
            facing: initialData.facing || undefined,
            landmark: initialData.landmark || undefined,
            notes: initialData.notes || undefined,
        }
        : {
            code: "",
            name: "",
            address: "",
            width: 0,
            height: 0,
            totalArea: 0,
            illumination: "NON_LIT",
            status: "AVAILABLE",
            maintenanceCycle: 90,
            cityId: "",
            holdingTypeId: "",
            hsnCodeId: "",
        };

    const form = useForm<HoldingFormData>({
        resolver: zodResolver(holdingSchema) as any,
        defaultValues: defaultValues as any,
    });
    // ... rest of the file remains strictly same minus the initialData typing change above
    const onSubmit = async (data: HoldingFormData) => {
        try {
            if (initialData && initialData.id) { // Only update if we have a real ID, not just pre-filled data
                await apiFetch(`/api/holdings/${initialData.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data),
                });
                toast.success("Holding updated successfully");
            } else {
                await apiFetch('/api/holdings', {
                    method: 'POST',
                    body: JSON.stringify(data),
                });
                toast.success("Holding created successfully");
            }
            router.push("/holdings");
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);
        }
    };

    // Auto generate code for new holdings
    useEffect(() => {
        if (!initialData?.id && !form.getValues("code")) {
            const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
            const timeStr = Date.now().toString().slice(-4);
            form.setValue("code", `HLD-${randomStr}-${timeStr}`);
        }
    }, [initialData?.id, form]);

    // Calculate area automatically
    const width = form.watch("width");
    const height = form.watch("height");

    useEffect(() => {
        if (width && height) {
            const area = Number(width) * Number(height);
            if (area !== form.getValues("totalArea")) {
                form.setValue("totalArea", area);
            }
        }
    }, [width, height, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Holding Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="Auto-generated unique code" {...field} readOnly className="bg-muted" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Descriptive name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Full address" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="landmark"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Landmark</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nearby landmark" {...field} value={field.value || ""} />
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
                                            <SelectValue placeholder="Select a city" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {cities.map((city) => (
                                            <SelectItem key={city.id} value={city.id}>
                                                {city.name}, {city.state}
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
                        name="holdingTypeId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {types.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 col-span-1 sm:col-span-2">
                        <FormField
                            control={form.control}
                            name="width"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Width (ft)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="height"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Height (ft)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="totalArea"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Area (sq.ft)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} readOnly className="bg-muted" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="illumination"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Illumination</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select illumination" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="LIT">Lit</SelectItem>
                                        <SelectItem value="NON_LIT">Non-Lit</SelectItem>
                                        <SelectItem value="DIGITAL">Digital</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="hsnCodeId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>HSN Code</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select HSN code" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {hsnCodes.map((code) => (
                                            <SelectItem key={code.id} value={code.id}>
                                                {code.code} ({String(code.gstRate)}%)
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
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="AVAILABLE">Available</SelectItem>
                                        <SelectItem value="BOOKED">Booked</SelectItem>
                                        <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
                                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="maintenanceCycle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Maintenance Cycle (Days)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="col-span-1 sm:col-span-2 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Location Coordinates <span className="text-red-500">*</span></span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={fetchCurrentLocation}
                                disabled={isFetchingLocation}
                                className="gap-2"
                            >
                                {isFetchingLocation ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Fetching...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="3" />
                                            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                                            <path d="m4.22 4.22 2.12 2.12M17.66 17.66l2.12 2.12M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
                                        </svg>
                                        Fetch Current Location
                                    </>
                                )}
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="latitude"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Latitude <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="any"
                                                placeholder="e.g. 23.0225"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : "")}
                                            />
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
                                        <FormLabel>Longitude <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="any"
                                                placeholder="e.g. 72.5714"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : "")}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <FormField
                        control={form.control}
                        name="facing"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Facing</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. North, East" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Additional notes" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
                    <Button variant="outline" type="button" onClick={() => router.back()} className="w-full sm:w-auto">
                        Cancel
                    </Button>
                    <Button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25">
                        {initialData && initialData.id ? "Update Holding" : "Create Holding"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
