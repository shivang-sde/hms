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
import { clientSchema, type ClientFormData } from "@/lib/validations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { City, Client } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { DocumentUpload } from "@/components/shared/document-upload";

interface ClientFormProps {
    initialData?: Client;
    cities: City[];
}

export function ClientForm({ initialData, cities }: ClientFormProps) {
    const router = useRouter();

    const defaultValues: Partial<ClientFormData> = initialData
        ? {
            name: initialData.name,
            contactPerson: initialData.contactPerson,
            email: initialData.email || "",
            phone: initialData.phone,
            gstNumber: initialData.gstNumber || undefined,
            panNumber: initialData.panNumber || undefined,
            address: initialData.address,
            cityId: initialData.cityId || undefined,
            isActive: initialData.isActive,
            kycDocumentUrl: initialData.kycDocumentUrl || undefined,
            agreementDocumentUrl: initialData.agreementDocumentUrl || undefined,
        }
        : {
            name: "",
            contactPerson: "",
            email: "",
            phone: "",
            gstNumber: "",
            panNumber: "",
            address: "",
            cityId: "",
            isActive: true,
            kycDocumentUrl: undefined,
            agreementDocumentUrl: undefined,
        };

    const form = useForm<ClientFormData>({
        resolver: zodResolver(clientSchema) as any,
        defaultValues: defaultValues as any,
    });

    const onSubmit = async (data: ClientFormData) => {
        try {
            if (initialData) {
                await apiFetch(`/api/clients/${initialData.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data),
                });
                toast.success("Client updated successfully");
            } else {
                await apiFetch('/api/clients', {
                    method: 'POST',
                    body: JSON.stringify(data),
                });
                toast.success("Client created successfully");
            }
            router.push("/clients");
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company / Client Name (Required)</FormLabel>
                                <FormControl>
                                    <Input placeholder="TechSolutions Pvt Ltd" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="contactPerson"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact Person (Required)</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="john@example.com" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone (Required)</FormLabel>
                                <FormControl>
                                    <Input placeholder="+91 98765 43210" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="gstNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>GST Number (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="22AAAAA0000A1Z5" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="panNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>PAN Number (Required)</FormLabel>
                                <FormControl>
                                    <Input placeholder="ABCDE1234F" {...field} value={field.value || ""} />
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
                                <FormLabel>Address (Required)</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Full billing address" {...field} />
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
                                <FormLabel>City (Required)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select city" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {cities.map((city) => (
                                            <SelectItem key={city.id} value={city.id}>
                                                {city.name} ({city.state})
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
                        name="isActive"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Active Client
                                    </FormLabel>
                                    <FormDescription>
                                        Uncheck this to disable creating new bookings for this client.
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />

                    {/* ── Document Uploads ─────────────────────────────────── */}
                    <div className="row-span-2 border-t pt-4">
                        <p className="font-semibold text-sm mb-4">Documents</p>
                        <div className="grid gap-4">
                            <FormField
                                control={form.control}
                                name="kycDocumentUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <DocumentUpload
                                                label="KYC Document"
                                                hint="Upload client's KYC (Aadhaar / PAN / Passport) as PDF or image"
                                                value={field.value ?? undefined}
                                                onChange={(url) => field.onChange(url ?? null)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="agreementDocumentUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <DocumentUpload
                                                label="Agreement Document"
                                                hint="Upload the signed client agreement (PDF or image)"
                                                value={field.value ?? undefined}
                                                onChange={(url) => field.onChange(url ?? null)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
                    <Button variant="outline" type="button" onClick={() => router.back()} className="w-full sm:w-auto">
                        Cancel
                    </Button>
                    <Button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25">
                        {initialData ? "Update Client" : "Create Client"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
