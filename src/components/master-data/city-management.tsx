"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Search, MapPin } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { citySchema, type CityFormData } from "@/lib/validations";
import { createCity, updateCity, deleteCity } from "@/actions/master-data";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface CityManagementProps {
    cities: any[];
}

export function CityManagement({ cities }: CityManagementProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCity, setEditingCity] = useState<any | null>(null);

    const form = useForm<CityFormData>({
        resolver: zodResolver(citySchema) as any,
        defaultValues: {
            name: "",
            state: "",
            country: "India",
            isActive: true,
        } as any,
    });

    const onSubmit = async (data: CityFormData) => {
        try {
            if (editingCity) {
                await updateCity(editingCity.id, data);
                toast.success("City updated successfully");
            } else {
                await createCity(data);
                toast.success("City created successfully");
            }
            setIsDialogOpen(false);
            setEditingCity(null);
            form.reset();
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    const handleEdit = (city: any) => {
        setEditingCity(city);
        form.reset({
            name: city.name,
            state: city.state,
            country: city.country,
            isActive: city.isActive,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this city?")) {
            try {
                await deleteCity(id);
                toast.success("City deleted successfully");
            } catch (error) {
                toast.error("Failed to delete city");
            }
        }
    };

    const filteredCities = cities.filter((city) =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.state.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search cities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingCity(null);
                        form.reset();
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="mr-2 h-4 w-4" /> Add City
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCity ? "Edit City" : "Add New City"}</DialogTitle>
                            <DialogDescription>
                                Enter the details for the city.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Mumbai" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Maharashtra" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <FormControl>
                                                <Input placeholder="India" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button type="submit" className="bg-indigo-600">
                                        {editingCity ? "Update" : "Save"}
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
                            <TableHead>State</TableHead>
                            <TableHead>Country</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCities.length > 0 ? (
                            filteredCities.map((city) => (
                                <TableRow key={city.id}>
                                    <TableCell className="font-medium">{city.name}</TableCell>
                                    <TableCell>{city.state}</TableCell>
                                    <TableCell>{city.country}</TableCell>
                                    <TableCell>
                                        <Badge variant={city.isActive ? "outline" : "secondary"} className={city.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : ""}>
                                            {city.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(city)}
                                                className="h-8 w-8 text-muted-foreground hover:text-indigo-600"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            {city.isActive && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(city.id)}
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
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No cities found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
