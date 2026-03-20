"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ownershipContractSchema, type OwnershipContractFormData } from "@/lib/validations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ContractFormProps {
    initialData?: any;
    holdings: any[];
}

export function ContractForm({ initialData, holdings }: ContractFormProps) {
    const router = useRouter();

    const defaultValues: Partial<OwnershipContractFormData> = initialData
        ? {
            contractNumber: initialData.contractNumber,
            ownerName: initialData.ownerName,
            ownerType: initialData.ownerType,
            ownerContact: initialData.ownerContact || undefined,
            ownerEmail: initialData.ownerEmail || undefined,
            ownerAddress: initialData.ownerAddress || undefined,
            rentAmount: Number(initialData.rentAmount),
            rentCycle: initialData.rentCycle,
            startDate: new Date(initialData.startDate),
            endDate: new Date(initialData.endDate),
            securityDeposit: initialData.securityDeposit ? Number(initialData.securityDeposit) : undefined,
            status: initialData.status,
            notes: initialData.notes || undefined,
            holdingId: initialData.holdingId,
        }
        : {
            contractNumber: "",
            ownerName: "",
            ownerType: "PRIVATE",
            rentAmount: 0,
            rentCycle: "MONTHLY",
            startDate: new Date(),
            endDate: undefined,
            status: "ACTIVE",
            holdingId: "",
        };

    const form = useForm<OwnershipContractFormData>({
        resolver: zodResolver(ownershipContractSchema) as any,
        defaultValues: defaultValues as any,
    });

    // Auto-generate contract number for new contracts
    useEffect(() => {
        if (!initialData && !form.getValues("contractNumber")) {
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
            form.setValue("contractNumber", `OC-${new Date().getFullYear()}-${random}`);
        }
    }, [initialData, form]);

    const onSubmit = async (data: OwnershipContractFormData) => {
        try {
            if (initialData) {
                await apiFetch(`/api/contracts/${initialData.id}`, {
                    method: "PUT",
                    body: JSON.stringify(data),
                });
                toast.success("Contract updated successfully");
            } else {
                await apiFetch("/api/contracts", {
                    method: "POST",
                    body: JSON.stringify(data),
                });
                toast.success("Contract created successfully");
            }
            router.push("/ownership-contracts");
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
                        name="contractNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contract Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Auto-generated" {...field} readOnly className="bg-muted" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="holdingId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Holding</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select holding" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {holdings.map((h: any) => (
                                            <SelectItem key={h.id} value={h.id}>
                                                {h.code} – {h.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="col-span-2 border-t pt-4">
                        <p className="font-semibold text-sm mb-4">Owner Details</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="ownerName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Owner Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Name of the land/property owner" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="ownerType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Owner Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="GOVERNMENT">Government</SelectItem>
                                                <SelectItem value="MUNICIPAL">Municipal</SelectItem>
                                                <SelectItem value="VILLAGE_PANCHAYAT">Village Panchayat</SelectItem>
                                                <SelectItem value="PRIVATE">Private</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="ownerContact"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="9876543210" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="ownerEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="owner@example.com" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="ownerAddress"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Owner Address</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Full address" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="col-span-2 border-t pt-4">
                        <p className="font-semibold text-sm mb-4">Financial & Terms</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="rentAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rent Amount (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="rentCycle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rent Cycle</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select cycle" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="MONTHLY">Monthly</SelectItem>
                                                <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                                                <SelectItem value="HALF_YEARLY">Half Yearly</SelectItem>
                                                <SelectItem value="YEARLY">Yearly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="securityDeposit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Security Deposit (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} value={field.value ?? ""} />
                                        </FormControl>
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
                                                <SelectItem value="ACTIVE">Active</SelectItem>
                                                <SelectItem value="EXPIRED">Expired</SelectItem>
                                                <SelectItem value="TERMINATED">Terminated</SelectItem>
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Start Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>End Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
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
                                    <Textarea placeholder="Additional terms or remarks..." {...field} value={field.value || ""} />
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
                        {initialData ? "Update Contract" : "Create Contract"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
