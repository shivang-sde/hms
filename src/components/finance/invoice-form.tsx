"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { invoiceSchema, type InvoiceFormData } from "@/lib/validations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Booking, Client, HsnCode } from "@prisma/client";

interface InvoiceFormProps {
    initialData?: {
        id: string;
        invoiceNumber: string;
        invoiceDate: Date;
        dueDate: Date;
        subtotal: any;
        cgstRate: any;
        sgstRate: any;
        igstRate: any;
        cgstAmount: any;
        sgstAmount: any;
        igstAmount: any;
        totalAmount: any;
        paidAmount: any;
        status: string;
        notes: string | null;
        clientId: string;
        bookingId: string;
        hsnCodeId: string;
    };
    clients: Client[];
    bookings: (Booking & {
        client: { name: string };
        holding: { code: string; name: string };
    })[];
    hsnCodes: HsnCode[];
}

export function InvoiceForm({ initialData, clients, bookings, hsnCodes }: InvoiceFormProps) {
    const router = useRouter();

    const defaultValues: Partial<InvoiceFormData> = initialData
        ? {
            invoiceNumber: initialData.invoiceNumber,
            invoiceDate: new Date(initialData.invoiceDate),
            dueDate: new Date(initialData.dueDate),
            subtotal: Number(initialData.subtotal),
            cgstRate: Number(initialData.cgstRate),
            sgstRate: Number(initialData.sgstRate),
            igstRate: Number(initialData.igstRate),
            cgstAmount: Number(initialData.cgstAmount),
            sgstAmount: Number(initialData.sgstAmount),
            igstAmount: Number(initialData.igstAmount),
            totalAmount: Number(initialData.totalAmount),
            paidAmount: Number(initialData.paidAmount),
            status: initialData.status as any,
            notes: initialData.notes || undefined,
            clientId: initialData.clientId,
            bookingId: initialData.bookingId,
            hsnCodeId: initialData.hsnCodeId,
        }
        : {
            invoiceNumber: "",
            invoiceDate: new Date(),
            dueDate: undefined,
            subtotal: 0,
            cgstRate: 9,
            sgstRate: 9,
            igstRate: 0,
            cgstAmount: 0,
            sgstAmount: 0,
            igstAmount: 0,
            totalAmount: 0,
            paidAmount: 0,
            status: "DRAFT",
            clientId: "",
            bookingId: "",
            hsnCodeId: "",
        };

    const form = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceSchema) as any,
        defaultValues: defaultValues as any,
    });

    const watchedClientId = form.watch("clientId");
    const watchedHsnCodeId = form.watch("hsnCodeId");
    const watchedBookingId = form.watch("bookingId");
    const watchedSubtotal = form.watch("subtotal");
    const watchedCgstRate = form.watch("cgstRate");
    const watchedSgstRate = form.watch("sgstRate");
    const watchedIgstRate = form.watch("igstRate");

    // Filter bookings based on selected client
    const filteredBookings = bookings.filter(b => b.clientId === watchedClientId);

    // Auto-fill booking amount if booking selected and subtotal is empty
    useEffect(() => {
        if (watchedBookingId && form.getValues("subtotal") === 0) {
            const booking = bookings.find(b => b.id === watchedBookingId);
            if (booking && booking.totalAmount) {
                form.setValue("subtotal", Number(booking.totalAmount));
            }
        }
    }, [watchedBookingId, bookings, form]);

    // Auto-calculate tax amounts
    useEffect(() => {
        const subtotal = Number(watchedSubtotal) || 0;
        const cgstRate = Number(watchedCgstRate) || 0;
        const sgstRate = Number(watchedSgstRate) || 0;
        const igstRate = Number(watchedIgstRate) || 0;

        const cgst = (subtotal * cgstRate) / 100;
        const sgst = (subtotal * sgstRate) / 100;
        const igst = (subtotal * igstRate) / 100;
        const total = subtotal + cgst + sgst + igst;

        form.setValue("cgstAmount", parseFloat(cgst.toFixed(2)));
        form.setValue("sgstAmount", parseFloat(sgst.toFixed(2)));
        form.setValue("igstAmount", parseFloat(igst.toFixed(2)));
        form.setValue("totalAmount", parseFloat(total.toFixed(2)));
    }, [watchedSubtotal, watchedCgstRate, watchedSgstRate, watchedIgstRate, form]);

    // Generate Invoice Number if new
    useEffect(() => {
        if (!initialData && !form.getValues("invoiceNumber")) {
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            form.setValue("invoiceNumber", `INV-${new Date().getFullYear()}-${random}`);
        }
    }, [initialData, form]);


    const onSubmit = async (data: InvoiceFormData) => {
        try {
            if (initialData) {
                await apiFetch(`/api/invoices/${initialData.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data),
                });
                toast.success("Invoice updated successfully");
            } else {
                await apiFetch('/api/invoices', {
                    method: 'POST',
                    body: JSON.stringify(data),
                });
                toast.success("Invoice created successfully");
            }
            router.push("/billing"); // Redirect to Billing Dashboard
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
                        name="invoiceNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Invoice Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Auto-generated" {...field} readOnly className="bg-muted" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="clientId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Client</FormLabel>
                                <Select onValueChange={(val) => {
                                    field.onChange(val);
                                    form.setValue("bookingId", ""); // Reset booking on client change
                                }} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="max-w-full">
                                            <SelectValue placeholder="Select client" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.id}>
                                                <span className="truncate">{client.name}</span>
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
                        name="bookingId"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Booking</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={!watchedClientId}
                                >
                                    <FormControl>
                                        <SelectTrigger className="max-w-full">
                                            <SelectValue placeholder={watchedClientId ? "Select booking" : "Select client first"} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {filteredBookings.length > 0 ? (
                                            filteredBookings.map((booking) => (
                                                <SelectItem key={booking.id} value={booking.id}>
                                                    <span className="truncate">{booking.bookingNumber} - {booking.holding.code} ({format(new Date(booking.startDate), 'MMM dd')} - {format(new Date(booking.endDate), 'MMM dd')})</span>
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="none" disabled>No bookings found for client</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="invoiceDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Invoice Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date("1900-01-01")
                                            }
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
                        name="dueDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Due Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date("1900-01-01")
                                            }
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
                                                {code.code} ({code.description})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="col-span-2 border-t py-4">
                        <p className="text-sm font-semibold mb-4">Financials</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormField
                                control={form.control}
                                name="subtotal"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subtotal (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cgstRate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CGST %</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sgstRate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SGST %</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="igstRate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>IGST %</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg">
                            <div>
                                <p className="text-xs text-muted-foreground">CGST Amount</p>
                                <p className="font-semibold">₹ {form.watch("cgstAmount")?.toFixed(2) || "0.00"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">SGST Amount</p>
                                <p className="font-semibold">₹ {form.watch("sgstAmount")?.toFixed(2) || "0.00"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">IGST Amount</p>
                                <p className="font-semibold">₹ {form.watch("igstAmount")?.toFixed(2) || "0.00"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Grand Total</p>
                                <p className="text-lg font-bold text-primary">₹ {form.watch("totalAmount")?.toFixed(2) || "0.00"}</p>
                            </div>
                        </div>
                    </div>

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
                                        <SelectItem value="DRAFT">Draft</SelectItem>
                                        <SelectItem value="SENT">Sent</SelectItem>
                                        <SelectItem value="PAID">Paid</SelectItem>
                                        <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                                        <SelectItem value="OVERDUE">Overdue</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                    <Textarea placeholder="Payment terms..." {...field} value={field.value || ""} />
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
                        {initialData ? "Update Invoice" : "Create Invoice"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
