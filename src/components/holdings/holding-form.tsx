"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";
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
import { createHolding, updateHolding } from "@/actions/holdings";
import { City, HoldingType, HsnCode, Holding } from "@prisma/client";

interface HoldingFormProps {
    initialData?: Partial<Holding>; // Changed from Holding to Partial<Holding> to support pre-filling from Suggestions
    cities: City[];
    types: HoldingType[];
    hsnCodes: HsnCode[];
}

export function HoldingForm({ initialData, cities, types, hsnCodes }: HoldingFormProps) {
    const router = useRouter();

    const defaultValues: Partial<HoldingFormData> = initialData
        ? {
            code: initialData.code || "",
            name: initialData.name || "",
            address: initialData.address || "",
            width: initialData.width ? Number(initialData.width) : 0,
            height: initialData.height ? Number(initialData.height) : 0,
            totalArea: initialData.totalArea ? Number(initialData.totalArea) : 0,
            latitude: initialData.latitude ? Number(initialData.latitude) : undefined,
            longitude: initialData.longitude ? Number(initialData.longitude) : undefined,
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
                await updateHolding(initialData.id, data);
                toast.success("Holding updated successfully");
            } else {
                await createHolding(data);
                toast.success("Holding created successfully");
            }
            router.push("/holdings");
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);
        }
    };

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
                                    <Input placeholder="Unique code e.g. HLD-MUM-001" {...field} />
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

                    <div className="grid grid-cols-3 gap-4 col-span-2">
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

                    <div className="grid grid-cols-2 gap-4 col-span-2">
                        <FormField
                            control={form.control}
                            name="latitude"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Latitude</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
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
                                        <Input type="number" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        {initialData && initialData.id ? "Update Holding" : "Create Holding"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
