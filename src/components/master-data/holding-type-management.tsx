"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Search, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { holdingTypeSchema, type HoldingTypeFormData } from "@/lib/validations";
import { createHoldingType, updateHoldingType, deleteHoldingType } from "@/actions/master-data";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface HoldingTypeManagementProps {
    holdingTypes: any[];
}

export function HoldingTypeManagement({ holdingTypes }: HoldingTypeManagementProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState<any | null>(null);

    const form = useForm<HoldingTypeFormData>({
        resolver: zodResolver(holdingTypeSchema) as any,
        defaultValues: {
            name: "",
            description: "",
            isActive: true,
        } as any,
    });

    const onSubmit = async (data: HoldingTypeFormData) => {
        try {
            if (editingType) {
                await updateHoldingType(editingType.id, data);
                toast.success("Holding type updated successfully");
            } else {
                await createHoldingType(data);
                toast.success("Holding type created successfully");
            }
            setIsDialogOpen(false);
            setEditingType(null);
            form.reset();
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    const handleEdit = (type: any) => {
        setEditingType(type);
        form.reset({
            name: type.name,
            description: type.description || "",
            isActive: type.isActive,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this holding type?")) {
            try {
                await deleteHoldingType(id);
                toast.success("Holding type deleted successfully");
            } catch (error) {
                toast.error("Failed to delete holding type");
            }
        }
    };

    const filteredTypes = holdingTypes.filter((type) =>
        type.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search holding types..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingType(null);
                        form.reset();
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="mr-2 h-4 w-4" /> Add Type
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingType ? "Edit Holding Type" : "Add New Holding Type"}</DialogTitle>
                            <DialogDescription>
                                Enter the details for the holding type.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Hoarding, Unipole" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Optional description..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button type="submit" className="bg-indigo-600">
                                        {editingType ? "Update" : "Save"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-xl border border-border/50 bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTypes.length > 0 ? (
                            filteredTypes.map((type) => (
                                <TableRow key={type.id}>
                                    <TableCell className="font-medium">{type.name}</TableCell>
                                    <TableCell className="max-w-[300px] truncate">
                                        {type.description || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={type.isActive ? "outline" : "secondary"} className={type.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : ""}>
                                            {type.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(type)}
                                                className="h-8 w-8 text-muted-foreground hover:text-indigo-600"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            {type.isActive && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(type.id)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No holding types found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
