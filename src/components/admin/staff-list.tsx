"use client";

import { User } from "@prisma/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, UserPlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteStaffUser } from "@/actions/users";
import { toast } from "sonner";

interface StaffListProps {
    staff: User[];
}

export function StaffList({ staff }: StaffListProps) {
    const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

    const togglePassword = (id: string) => {
        setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this staff account?")) {
            try {
                await deleteStaffUser(id);
                toast.success("Staff member deleted successfully");
            } catch (error) {
                toast.error("Failed to delete staff member");
            }
        }
    };

    return (
        <div className="rounded-md border bg-white shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="font-semibold text-slate-700">Name</TableHead>
                        <TableHead className="font-semibold text-slate-700">Email</TableHead>
                        <TableHead className="font-semibold text-slate-700">Password</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {staff.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-10 text-slate-500">
                                No staff members found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        staff.map((user) => (
                            <TableRow key={user.id} className="hover:bg-slate-50 transition-colors">
                                <TableCell className="font-medium text-slate-900">{user.name}</TableCell>
                                <TableCell className="text-slate-600">{user.email}</TableCell>
                                <TableCell className="text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs min-w-[80px]">
                                            {showPasswords[user.id] ? user.plainPassword : "••••••••"}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => togglePassword(user.id)}
                                        >
                                            {showPasswords[user.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
